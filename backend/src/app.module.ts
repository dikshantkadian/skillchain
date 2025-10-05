import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { CertificatesModule } from './certificates/certificates.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    PrismaModule,
    CertificatesModule,
    AuthModule,     // Register the Security Department
    UsersModule,    // Register the HR Department
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}