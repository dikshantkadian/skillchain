import {
  Injectable,
  OnModuleInit,
  NotFoundException,
  ConflictException,
  InternalServerErrorException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ethers } from 'ethers';
import * as contractABI from '../abi/Skillchain.json';
import * as crypto from 'crypto';
import axios from 'axios';
import FormData from 'form-data';

@Injectable()
export class CertificatesService implements OnModuleInit {
  private provider: ethers.JsonRpcProvider;
  private wallet: ethers.Wallet;
  private contract: ethers.Contract;

  constructor(private prisma: PrismaService) {}

  onModuleInit() {
    const rpcUrl = process.env.SEPOLIA_RPC_URL;
    const privateKey = process.env.PRIVATE_KEY;
    const contractAddress = process.env.CERTIFICATE_CONTRACT_ADDRESS;
    if (!rpcUrl || !privateKey || !contractAddress) {
      throw new Error('FATAL ERROR: Missing required blockchain env variables.');
    }
    this.provider = new ethers.JsonRpcProvider(rpcUrl);
    this.wallet = new ethers.Wallet(privateKey, this.provider);
    this.contract = new ethers.Contract(
      contractAddress,
      contractABI.abi,
      this.wallet,
    );
    console.log('Blockchain service initialized and connected.');
  }

  // --- Skill #1: Create a Certificate ---
  async create(
    title: string,
    description: string,
    studentEmail: string,
    file: Express.Multer.File,
    institutionId: string,
  ) {
    const student = await this.prisma.user.findUnique({ where: { email: studentEmail } });
    if (!student) {
      throw new NotFoundException(`Student with email ${studentEmail} not found.`);
    }

    const fileHash = crypto.createHash('sha256').update(file.buffer).digest('hex');
    const existingCert = await this.prisma.certificate.findUnique({ where: { fileHash } });
    if (existingCert) {
      throw new ConflictException('A certificate with this exact file already exists.');
    }
    
    const formData = new FormData();
    formData.append('file', file.buffer, file.originalname);

    let ipfsCid = '';
    try {
      const pinataResponse = await axios.post(
        'https://api.pinata.cloud/pinning/pinFileToIPFS',
        formData,
        {
          headers: {
            ...formData.getHeaders(),
            Authorization: `Bearer ${process.env.PINATA_JWT}`,
          },
        },
      );
      ipfsCid = pinataResponse.data.IpfsHash;
      console.log('File successfully uploaded to IPFS. CID:', ipfsCid);
    } catch (error) {
      console.error('Error uploading to Pinata:', error.response?.data || error.message);
      throw new InternalServerErrorException('Failed to upload certificate file to IPFS.');
    }

    console.log(`Issuing certificate on blockchain for student ${student.email}...`);
    const studentWalletAddress = student.walletAddress || '0x0000000000000000000000000000000000000000';
    
    const tx = await this.contract.issueCertificate(
      studentWalletAddress,
      title,
      description,
      ipfsCid,
    );
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

  // --- Skill #2: Verify a Hash for Recruiters ---
  async verifyByFileHash(fileHash: string) {
    const certificate = await this.prisma.certificate.findUnique({
      where: { fileHash: fileHash },
      include: {
        student: { select: { name: true, email: true } },
        institution: { select: { name: true, email: true } },
      },
    });

    if (!certificate) {
      throw new NotFoundException('Certificate with this hash was not found.');
    }

    return certificate;
  }

  // --- Skill #3: Find Certificates for a Student ---
  async findForStudent(studentId: string) {
    const certificates = await this.prisma.certificate.findMany({
      where: { studentId: studentId },
      orderBy: { issueDate: 'desc' }, 
      include: {
        institution: { select: { name: true } },
      },
    });

    return certificates;
  }
}
