import { Module } from '@nestjs/common';
import { DeepCorrectionsService } from './deep-corrections.service';
import { MessageController } from './deep-corrections.controller';
import { PrismaModule } from '@/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [MessageController],
  providers: [DeepCorrectionsService],
  exports: [DeepCorrectionsService],
})
export class DeepCorrectionsModule {}
