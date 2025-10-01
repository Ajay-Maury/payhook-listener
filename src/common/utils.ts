import * as crypto from 'crypto';
import { Logger } from '@nestjs/common';
import { CreatePaymentEventDto } from 'src/webhook/dto/createPaymentEvent.dto';

const logger = new Logger('Utils');

/**
 * Compute an HMAC-SHA256 digest in hex format.
 * Used for verifying webhook signatures.
 */
export function computeHmacHex(secret: string, raw: Buffer | string) {
  logger.debug(`Computing HMAC with secret length=${secret.length}`);
  return crypto.createHmac('sha256', secret).update(raw).digest('hex');
}

/**
 * Extract key fields from the webhook payload
 * and map them into a DTO for validation & persistence.
 */
export function extractFields(payload: any) {
  logger.debug('Extracting fields from webhook payload');

  const event_id = payload?.id || null;
  const event_type = payload?.event || null;

  // Payment details from nested structure
  const payment_id = payload?.payload?.payment?.entity?.id || null;
  const amount = payload?.payload?.payment?.entity?.amount || null;
  const currency = payload?.payload?.payment?.entity?.currency || null;
  const status = payload?.payload?.payment?.entity?.status || null;

  // In provider payload we don’t usually get "received_at", so fallback to now
  const received_at =
    payload?.payload?.payment?.entity?.received_at || new Date();

  const dto: CreatePaymentEventDto = {
    event_id,
    event_type: normalizeEventType(event_type) as any,
    payment_id,
    amount,
    currency,
    status,
    received_at,
  };

  logger.verbose(
    `Extracted event_id=${event_id}, event_type=${event_type}, payment_id=${payment_id}`,
  );

  return dto;
}

/**
 * Convert eventType strings like "payment.authorized" → "payment_authorized"
 * because Prisma enums cannot contain dots.
 */
export function normalizeEventType(eventType: string | null): string | null {
  if (!eventType) {
    logger.warn('normalizeEventType: received null eventType');
    return null;
  }
  const normalized = eventType.replace('.', '_');
  logger.debug(`Normalized eventType: ${eventType} → ${normalized}`);
  return normalized;
}
