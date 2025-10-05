"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CertificatesController = void 0;
const common_1 = require("@nestjs/common");
const passport_1 = require("@nestjs/passport");
const certificates_service_1 = require("./certificates.service");
const platform_express_1 = require("@nestjs/platform-express");
const create_certificate_dto_1 = require("./dto/create-certificate.dto");
let CertificatesController = class CertificatesController {
    certificatesService;
    constructor(certificatesService) {
        this.certificatesService = certificatesService;
    }
    issueCertificate(req, createCertificateDto, file) {
        const institutionId = req.user.id;
        const { title, description, studentEmail } = createCertificateDto;
        return this.certificatesService.create(title, description, studentEmail, file, institutionId);
    }
    verifyCertificate(hash) {
        return this.certificatesService.verifyByFileHash(hash);
    }
    getMyCertificates(req) {
        const studentId = req.user.id;
        return this.certificatesService.findForStudent(studentId);
    }
};
exports.CertificatesController = CertificatesController;
__decorate([
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    (0, common_1.Post)('issue'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file')),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.UploadedFile)(new common_1.ParseFilePipe({
        validators: [
            new common_1.MaxFileSizeValidator({ maxSize: 10 * 1024 * 1024 }),
            new common_1.FileTypeValidator({ fileType: '.(png|jpeg|jpg|pdf)' }),
        ],
    }))),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, create_certificate_dto_1.CreateCertificateDto, Object]),
    __metadata("design:returntype", void 0)
], CertificatesController.prototype, "issueCertificate", null);
__decorate([
    (0, common_1.Get)('verify/:hash'),
    __param(0, (0, common_1.Param)('hash')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], CertificatesController.prototype, "verifyCertificate", null);
__decorate([
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    (0, common_1.Get)('my-certificates'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], CertificatesController.prototype, "getMyCertificates", null);
exports.CertificatesController = CertificatesController = __decorate([
    (0, common_1.Controller)('certificates'),
    __metadata("design:paramtypes", [certificates_service_1.CertificatesService])
], CertificatesController);
//# sourceMappingURL=certificates.controller.js.map