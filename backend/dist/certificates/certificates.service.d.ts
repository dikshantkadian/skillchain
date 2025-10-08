import { OnModuleInit } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
export declare class CertificatesService implements OnModuleInit {
    private prisma;
    private provider;
    private wallet;
    private contract;
    constructor(prisma: PrismaService);
    onModuleInit(): void;
    create(title: string, description: string, studentEmail: string, file: Express.Multer.File, institutionId: string): Promise<{
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
    verifyByFileHash(fileHash: string): Promise<{
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
    findForStudent(studentId: string): Promise<({
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
