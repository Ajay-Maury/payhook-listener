import { EventTypeEnum, PaymentStatusEnum } from "@prisma/client";
import { IsDate, IsEnum, IsInt, IsNotEmpty, IsString } from "class-validator";

export class CreatePaymentEventDto {
  @IsNotEmpty()
  @IsString()
  event_id: string;

  @IsNotEmpty()
  @IsEnum(EventTypeEnum)
  event_type: EventTypeEnum;

  @IsNotEmpty()
  @IsString()
  payment_id: string;

  @IsNotEmpty()
  @IsInt()
  amount: number;

  @IsNotEmpty()
  @IsString()
  currency: string;

  @IsNotEmpty()
  @IsEnum(PaymentStatusEnum)
  status: PaymentStatusEnum;

  @IsNotEmpty()
  @IsDate()
  received_at: Date = new Date();
}