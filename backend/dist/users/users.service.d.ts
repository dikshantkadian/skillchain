import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
export declare class UsersService {
    private prisma;
    constructor(prisma: PrismaService);
    create(createUserDto: CreateUserDto): Promise<{
        id: string;
        name: string | null;
        email: string;
        walletAddress: string | null;
        role: import("@prisma/client").$Enums.Role;
    }>;
    findOne(email: string): Promise<{
        id: string;
        name: string | null;
        email: string;
        walletAddress: string | null;
        password: string;
        role: import("@prisma/client").$Enums.Role;
    } | null>;
}
