import { EventTypeEnum, PaymentStatusEnum } from '@prisma/client';
import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class PaymentEntityDto {
  @IsNotEmpty()
  @IsString()
  id: string;

  @IsNotEmpty()
  @IsEnum(PaymentStatusEnum)
  status: PaymentStatusEnum;

  @IsNotEmpty()
  @IsInt()
  amount: number;

  @IsNotEmpty()
  @IsString()
  currency: string;
}

export class PaymentWrapperDto {
  @ValidateNested()
  @Type(() => PaymentEntityDto)
  entity: PaymentEntityDto;
}

export class PayloadDto {
  @ValidateNested()
  @Type(() => PaymentWrapperDto)
  payment: PaymentWrapperDto;
}

export class CreatePaymentEventPayloadDto {
  @IsNotEmpty()
  @IsString()
  id: string; // provider event id (evt_fail_001)

  @IsNotEmpty()
  @IsEnum(EventTypeEnum)
  event: EventTypeEnum; // "payment_failed" after normalization

  @ValidateNested()
  @Type(() => PayloadDto)
  payload: PayloadDto;

  @IsNotEmpty()
  @IsInt()
  created_at: number; // unix timestamp from provider

  // System fields (not in payload, set by app)
  received_at: Date = new Date();
}
