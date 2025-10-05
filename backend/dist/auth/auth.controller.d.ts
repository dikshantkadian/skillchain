import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { CreateUserDto } from '../users/dto/create-user.dto';
export declare class AuthController {
    private authService;
    private usersService;
    constructor(authService: AuthService, usersService: UsersService);
    login(req: any): Promise<{
        access_token: string;
    }>;
    register(createUserDto: CreateUserDto): Promise<{
        id: string;
        name: string | null;
        email: string;
        walletAddress: string | null;
        role: import("@prisma/client").$Enums.Role;
    }>;
}
