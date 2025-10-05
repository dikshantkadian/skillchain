import {
  Controller,
  Post,
  Body,
  UseGuards,
  Request,
  UseInterceptors,
  UploadedFile,
  ParseFilePipe,
  MaxFileSizeValidator,
  FileTypeValidator,
  Get,
  Param,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { CertificatesService } from './certificates.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { CreateCertificateDto } from './dto/create-certificate.dto';

@Controller('certificates')
export class CertificatesController {
  constructor(private readonly certificatesService: CertificatesService) {}

  // --- Endpoint #1: Issue a Certificate (For Institutions) ---
  @UseGuards(AuthGuard('jwt'))
  @Post('issue')
  @UseInterceptors(FileInterceptor('file'))
  issueCertificate(
    @Request() req,
    @Body() createCertificateDto: CreateCertificateDto,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 10 * 1024 * 1024 }), // 10MB
          new FileTypeValidator({ fileType: '.(png|jpeg|jpg|pdf)' }),
        ],
      }),
    )
    file: Express.Multer.File,
  ) {
    const institutionId = req.user.id;
    const { title, description, studentEmail } = createCertificateDto;
    
    return this.certificatesService.create(
      title,
      description,
      studentEmail,
      file, 
      institutionId,
    );
  }

  // --- Endpoint #2: Verify a Hash (For Recruiters, Public) ---
  @Get('verify/:hash')
  verifyCertificate(@Param('hash') hash: string) {
    return this.certificatesService.verifyByFileHash(hash);
  }

  // --- Endpoint #3: Get My Certificates (For Students) ---
  @UseGuards(AuthGuard('jwt'))
  @Get('my-certificates')
  getMyCertificates(@Request() req) {
    const studentId = req.user.id;
    return this.certificatesService.findForStudent(studentId);
  }
}
