import { IsEmail, IsString, IsNotEmpty } from 'class-validator';

export class CreateCertificateDto {
  @IsEmail()
  @IsNotEmpty()
  studentEmail: string;

  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  description: string;
}