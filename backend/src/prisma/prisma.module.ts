import { Module, Global } from '@nestjs/common'; // <-- Import Global
import { PrismaService } from './prisma.service';

@Global() // <-- THIS IS YOUR BRILLIANT SUGGESTION!
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}