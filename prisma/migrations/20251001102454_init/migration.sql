-- CreateEnum
CREATE TYPE "public"."EventTypeEnum" AS ENUM ('payment_authorized', 'payment_captured', 'payment_failed');

-- CreateEnum
CREATE TYPE "public"."PaymentStatusEnum" AS ENUM ('authorized', 'captured', 'failed');

-- CreateTable
CREATE TABLE "public"."PaymentEvent" (
    "id" SERIAL NOT NULL,
    "event_id" TEXT NOT NULL,
    "event_type" "public"."EventTypeEnum" NOT NULL,
    "payment_id" TEXT NOT NULL,
    "status" "public"."PaymentStatusEnum" NOT NULL,
    "amount" INTEGER NOT NULL,
    "currency" TEXT NOT NULL,
    "received_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PaymentEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PaymentEvent_event_id_key" ON "public"."PaymentEvent"("event_id");

-- CreateIndex
CREATE INDEX "PaymentEvent_payment_id_idx" ON "public"."PaymentEvent"("payment_id");
