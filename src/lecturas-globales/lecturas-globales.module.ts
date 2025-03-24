import { Module } from '@nestjs/common';
import { LecturasGlobalesService } from './lecturas-globales.service';
import { LecturasGlobalesController } from './lecturas-globales.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [PrismaModule, HttpModule, ConfigModule],
  controllers: [LecturasGlobalesController],
  providers: [LecturasGlobalesService],
})
export class LecturasGlobalesModule {}