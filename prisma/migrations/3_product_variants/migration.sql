-- Velikosti, sklad po velikostech a barvách, prodej na zakázku

ALTER TABLE "Product" ADD COLUMN "sizeType" TEXT;
ALTER TABLE "Product" ADD COLUMN "sizeOptions" TEXT NOT NULL DEFAULT '{}';
ALTER TABLE "Product" ADD COLUMN "allowBackorder" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Product" ADD COLUMN "backorderLeadTime" TEXT;

-- Původní tabulka variant (name/value) se v aplikaci nikdy nepoužívala – nahrazuje ji sklad po velikosti a barvě
DELETE FROM "ProductVariant";
ALTER TABLE "ProductVariant" DROP COLUMN "name";
ALTER TABLE "ProductVariant" DROP COLUMN "value";
ALTER TABLE "ProductVariant" DROP COLUMN "priceAdjustment";
ALTER TABLE "ProductVariant" ADD COLUMN "size" TEXT NOT NULL DEFAULT '';
ALTER TABLE "ProductVariant" ADD COLUMN "color" TEXT NOT NULL DEFAULT '';
CREATE UNIQUE INDEX "ProductVariant_productId_size_color_key" ON "ProductVariant"("productId", "size", "color");

ALTER TABLE "OrderItem" ADD COLUMN "variantSize" TEXT;
ALTER TABLE "OrderItem" ADD COLUMN "variantColor" TEXT;
ALTER TABLE "OrderItem" ADD COLUMN "stockReserved" INTEGER;
