import { Module } from '@nestjs/common';
import { CertificatesService } from './certificates.service';
import { CertificatesController } from './certificates.controller';
// We don't need to import PrismaModule here anymore!

@Module({
  imports: [], // <-- This is now empty, which is cleaner!
  controllers: [CertificatesController],
  providers: [CertificatesService],
})
export class CertificatesModule {}