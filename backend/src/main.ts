import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // --- REPLACE the simple app.enableCors() WITH THIS BLOCK ---
  app.enableCors({
    origin: '*', // Allow any origin
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    preflightContinue: false,
    optionsSuccessStatus: 204,
  });
  // ----------------------------------------------------------

  app.useGlobalPipes(new ValidationPipe());
  await app.listen(3000);
}
bootstrap();
