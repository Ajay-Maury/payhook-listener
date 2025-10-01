import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaService } from './prisma/prisma.service';
import { WebhookModule } from './webhook/webhook.module';

@Module({
  imports: [WebhookModule],
  controllers: [AppController],
  providers: [AppService, PrismaService],
})
export class AppModule {}
