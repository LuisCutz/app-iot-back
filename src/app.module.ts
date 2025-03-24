import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
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
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}