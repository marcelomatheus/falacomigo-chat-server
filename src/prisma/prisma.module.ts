import { Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { PrismaExceptionFilter } from './prisma-exception.filter';

@Module({
  providers: [PrismaService, PrismaExceptionFilter],
  exports: [PrismaService, PrismaExceptionFilter],
})
export class PrismaModule {}
