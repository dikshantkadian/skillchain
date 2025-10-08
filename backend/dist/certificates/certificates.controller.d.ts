import { CertificatesService } from './certificates.service';
import { CreateCertificateDto } from './dto/create-certificate.dto';
export declare class CertificatesController {
    private readonly certificatesService;
    constructor(certificatesService: CertificatesService);
    issueCertificate(req: any, createCertificateDto: CreateCertificateDto, file: Express.Multer.File): Promise<{
        institution: {
            name: string | null;
            email: string;
        };
        student: {
            name: string | null;
            email: string;
        };
    } & {
        id: string;
        ipfsCid: string;
        title: string;
        description: string;
        transactionHash: string;
        fileHash: string;
        issueDate: Date;
        institutionId: string;
        studentId: string;
    }>;
    verifyCertificate(hash: string): Promise<{
        institution: {
            name: string | null;
            email: string;
        };
        student: {
            name: string | null;
            email: string;
        };
    } & {
        id: string;
        ipfsCid: string;
        title: string;
        description: string;
        transactionHash: string;
        fileHash: string;
        issueDate: Date;
        institutionId: string;
        studentId: string;
    }>;
    getMyCertificates(req: any): Promise<({
        institution: {
            name: string | null;
        };
    } & {
        id: string;
        ipfsCid: string;
        title: string;
        description: string;
        transactionHash: string;
        fileHash: string;
        issueDate: Date;
        institutionId: string;
        studentId: string;
    })[]>;
}
