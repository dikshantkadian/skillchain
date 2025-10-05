import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // This is the most important line!
  // It tells the bouncer to allow calls from other addresses.
  app.enableCors(); 

  app.useGlobalPipes(new ValidationPipe());
  await app.listen(3000);
}
bootstrap();