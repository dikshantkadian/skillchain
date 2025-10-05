import { CertificatesService } from './certificates.service';
import { CreateCertificateDto } from './dto/create-certificate.dto';
export declare class CertificatesController {
    private readonly certificatesService;
    constructor(certificatesService: CertificatesService);
    issueCertificate(req: any, createCertificateDto: CreateCertificateDto, file: Express.Multer.File): Promise<{
        institution: {
            email: string;
            name: string | null;
        };
        student: {
            email: string;
            name: string | null;
        };
    } & {
        title: string;
        description: string;
        id: string;
        issueDate: Date;
        transactionHash: string;
        fileHash: string;
        ipfsCid: string;
        institutionId: string;
        studentId: string;
    }>;
    verifyCertificate(hash: string): Promise<{
        institution: {
            email: string;
            name: string | null;
        };
        student: {
            email: string;
            name: string | null;
        };
    } & {
        title: string;
        description: string;
        id: string;
        issueDate: Date;
        transactionHash: string;
        fileHash: string;
        ipfsCid: string;
        institutionId: string;
        studentId: string;
    }>;
    getMyCertificates(req: any): Promise<({
        institution: {
            name: string | null;
        };
    } & {
        title: string;
        description: string;
        id: string;
        issueDate: Date;
        transactionHash: string;
        fileHash: string;
        ipfsCid: string;
        institutionId: string;
        studentId: string;
    })[]>;
}
