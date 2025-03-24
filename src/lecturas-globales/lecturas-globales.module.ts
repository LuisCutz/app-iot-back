import { Module } from '@nestjs/common';
import { LecturasGlobalesService } from './lecturas-globales.service';
import { LecturasGlobalesController } from './lecturas-globales.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [PrismaModule, HttpModule],
  controllers: [LecturasGlobalesController],
  providers: [LecturasGlobalesService],
})
export class LecturasGlobalesModule {}