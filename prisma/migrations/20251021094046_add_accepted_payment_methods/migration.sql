-- AlterTable
ALTER TABLE "User"
  ADD COLUMN "acceptedPaymentMethods" JSONB DEFAULT '["cash","bank_transfer","paypay","line_pay"]';

-- Copy existing data when present
UPDATE "User"
SET "acceptedPaymentMethods" = COALESCE(
    "paymentMethods",
    '["cash","bank_transfer","paypay","line_pay"]'::jsonb
  );

-- Enforce constraints and remove old column
ALTER TABLE "User"
  ALTER COLUMN "acceptedPaymentMethods" SET NOT NULL,
  ALTER COLUMN "acceptedPaymentMethods" SET DEFAULT '["cash","bank_transfer","paypay","line_pay"]';

ALTER TABLE "User" DROP COLUMN IF EXISTS "paymentMethods";
