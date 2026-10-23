-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "hideWhenSoldOut" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "SaleEvent" ADD COLUMN     "separateListing" BOOLEAN NOT NULL DEFAULT false;

