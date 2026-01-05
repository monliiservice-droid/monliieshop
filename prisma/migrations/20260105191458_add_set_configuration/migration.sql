-- AlterTable
ALTER TABLE "Product" ADD COLUMN "isSet" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "setOptions" TEXT DEFAULT '{}';
