import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { PrismaModule } from './prisma/prisma.module';
import { ConfigurationModule } from './config/config.module';
import { ScheduleModule } from '@nestjs/schedule';
import { LecturasGlobalesModule } from './lecturas-globales/lecturas-globales.module';

@Module({
  imports: [
    ConfigurationModule,
    AuthModule,
    PrismaModule,
    ScheduleModule.forRoot(),
    LecturasGlobalesModule,
  ],
})
export class AppModule {}