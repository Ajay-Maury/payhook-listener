import {
  Module,
  MiddlewareConsumer,
  RequestMethod,
} from '@nestjs/common';
import { WebhookController } from './webhook.controller';
import { WebhookService } from './webhook.service';
import { PrismaService } from '../prisma/prisma.service';
import { SignatureMiddleware } from '../common/signature.middleware';

@Module({
  controllers: [WebhookController],
  providers: [WebhookService, PrismaService],
})
export class WebhookModule {
  configure(consumer: MiddlewareConsumer) {
    // Apply signature middleware only to POST /webhook/payments
    consumer
      .apply(SignatureMiddleware)
      .forRoutes({ path: 'webhook/payments', method: RequestMethod.POST });
  }
}
