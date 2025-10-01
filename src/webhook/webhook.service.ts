import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreatePaymentEventDto } from './dto/createPaymentEvent.dto';

@Injectable()
export class WebhookService {
  private readonly logger = new Logger(WebhookService.name);

  constructor(private prisma: PrismaService) {}

  async saveEvent(dto: CreatePaymentEventDto) {
    const {
      event_id,
      event_type,
      payment_id,
      amount,
      currency,
      status,
      received_at,
    } = dto;

    try {
      // Save new event
      const event = await this.prisma.paymentEvent.create({
        data: {
          event_id,
          event_type,
          payment_id,
          amount,
          currency,
          status,
          received_at,
        },
      });

      this.logger.log(`Event ${event_id} saved successfully`);
      return event;
    } catch (err: any) {
      // Handle duplicate event (idempotency)
      if (err.code === 'P2002') {
        this.logger.warn(`Duplicate event ${event_id} ignored`);
        return null;
      }

      this.logger.error(`Failed to save event ${event_id}`, err.stack);
      throw err;
    }
  }

  async getEventsByPaymentId(payment_id: string) {
    this.logger.debug(`Fetching events for payment_id=${payment_id}`);

    return this.prisma.paymentEvent.findMany({
      where: { payment_id },
      orderBy: { received_at: 'asc' },
      select: { event_type: true, received_at: true }, // returns clean response
    });
  }
}
