"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CertificatesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const ethers_1 = require("ethers");
const contractABI = __importStar(require("../abi/Skillchain.json"));
const crypto = __importStar(require("crypto"));
const axios_1 = __importDefault(require("axios"));
const form_data_1 = __importDefault(require("form-data"));
let CertificatesService = class CertificatesService {
    prisma;
    provider;
    wallet;
    contract;
    constructor(prisma) {
        this.prisma = prisma;
    }
    onModuleInit() {
        const rpcUrl = process.env.SEPOLIA_RPC_URL;
        const privateKey = process.env.PRIVATE_KEY;
        const contractAddress = process.env.CERTIFICATE_CONTRACT_ADDRESS;
        if (!rpcUrl || !privateKey || !contractAddress) {
            throw new Error('FATAL ERROR: Missing required blockchain env variables.');
        }
        this.provider = new ethers_1.ethers.JsonRpcProvider(rpcUrl);
        this.wallet = new ethers_1.ethers.Wallet(privateKey, this.provider);
        this.contract = new ethers_1.ethers.Contract(contractAddress, contractABI.abi, this.wallet);
        console.log('Blockchain service initialized and connected.');
    }
    async create(title, description, studentEmail, file, institutionId) {
        const student = await this.prisma.user.findUnique({ where: { email: studentEmail } });
        if (!student) {
            throw new common_1.NotFoundException(`Student with email ${studentEmail} not found.`);
        }
        const fileHash = crypto.createHash('sha256').update(file.buffer).digest('hex');
        const existingCert = await this.prisma.certificate.findUnique({ where: { fileHash } });
        if (existingCert) {
            throw new common_1.ConflictException('A certificate with this exact file already exists.');
        }
        const formData = new form_data_1.default();
        formData.append('file', file.buffer, file.originalname);
        let ipfsCid = '';
        try {
            const pinataResponse = await axios_1.default.post('https://api.pinata.cloud/pinning/pinFileToIPFS', formData, {
                headers: {
                    ...formData.getHeaders(),
                    Authorization: `Bearer ${process.env.PINATA_JWT}`,
                },
            });
            ipfsCid = pinataResponse.data.IpfsHash;
            console.log('File successfully uploaded to IPFS. CID:', ipfsCid);
        }
        catch (error) {
            console.error('Error uploading to Pinata:', error.response?.data || error.message);
            throw new common_1.InternalServerErrorException('Failed to upload certificate file to IPFS.');
        }
        console.log(`Issuing certificate on blockchain for student ${student.email}...`);
        const studentWalletAddress = student.walletAddress || '0x0000000000000000000000000000000000000000';
        const tx = await this.contract.issueCertificate(studentWalletAddress, title, description, ipfsCid);
        const receipt = await tx.wait();
        const transactionHash = receipt.hash;
        console.log('Certificate issued! Transaction hash:', transactionHash);
        const newCertificate = await this.prisma.certificate.create({
            data: {
                title, description, transactionHash, fileHash, ipfsCid,
                student: { connect: { id: student.id } },
                institution: { connect: { id: institutionId } },
            },
            include: {
                student: { select: { name: true, email: true } },
                institution: { select: { name: true, email: true } },
            },
        });
        return newCertificate;
    }
    async verifyByFileHash(fileHash) {
        const certificate = await this.prisma.certificate.findUnique({
            where: { fileHash: fileHash },
            include: {
                student: { select: { name: true, email: true } },
                institution: { select: { name: true, email: true } },
            },
        });
        if (!certificate) {
            throw new common_1.NotFoundException('Certificate with this hash was not found.');
        }
        return certificate;
    }
    async findForStudent(studentId) {
        const certificates = await this.prisma.certificate.findMany({
            where: { studentId: studentId },
            orderBy: { issueDate: 'desc' },
            include: {
                institution: { select: { name: true } },
            },
        });
        return certificates;
    }
};
exports.CertificatesService = CertificatesService;
exports.CertificatesService = CertificatesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], CertificatesService);
//# sourceMappingURL=certificates.service.js.map