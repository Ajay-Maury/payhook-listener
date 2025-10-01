import {
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Post,
  Req,
} from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import type { Request } from 'express';
import { extractFields } from '../common/utils';
import { CreatePaymentEventDto } from './dto/createPaymentEvent.dto';
import { WebhookService } from './webhook.service';

@Controller('webhook')
export class WebhookController {
  constructor(private readonly webhookService: WebhookService) {}

  @Post('payments')
  async receiveWebhook(@Req() req: Request) {
    // Signature already validated by middleware

    let payload: any;
    try {
      payload = JSON.parse((req as any).rawBody.toString('utf-8'));
    } catch {
      throw new HttpException('Invalid JSON', HttpStatus.BAD_REQUEST);
    }

    // Map incoming JSON → DTO shape
    const payloadDto: CreatePaymentEventDto = extractFields(payload);

    // Transform plain object into class instance
    const dto = plainToInstance(CreatePaymentEventDto, payloadDto);

    // Run validation rules from DTO decorators
    const errors = await validate(dto);
    if (errors.length > 0) {
      throw new HttpException(
        { success: false, message: 'Bad Request', errors },
        HttpStatus.BAD_REQUEST,
      );
    }

    // Save event using service (handles idempotency)
    const saved = await this.webhookService.saveEvent(dto);
    if (!saved) {
      return { success: false, message: 'Event already exists' };
    }

    return { success: true, message: 'Event saved' };
  }

  @Get('payments/:payment_id/events')
  async getEvents(@Param('payment_id') payment_id: string) {
    return this.webhookService.getEventsByPaymentId(payment_id);
  }
}
