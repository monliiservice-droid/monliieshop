-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "categoryId" TEXT,
ADD COLUMN     "isFeatured" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "isVisible" BOOLEAN NOT NULL DEFAULT true;

-- CreateTable
CREATE TABLE "Category" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "image" TEXT,
    "parentId" TEXT,
    "sizeType" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isVisible" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Category_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SaleEvent" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "bannerImage" TEXT,
    "discountPercent" DOUBLE PRECISION NOT NULL,
    "startsAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endsAt" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "scope" TEXT NOT NULL DEFAULT 'all',
    "showInMenu" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SaleEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PageSection" (
    "id" TEXT NOT NULL,
    "page" TEXT NOT NULL DEFAULT 'home',
    "type" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isVisible" BOOLEAN NOT NULL DEFAULT true,
    "data" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PageSection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_SaleEventProducts" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "_SaleEventCategories" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "Category_slug_key" ON "Category"("slug");

-- CreateIndex
CREATE INDEX "Category_parentId_idx" ON "Category"("parentId");

-- CreateIndex
CREATE UNIQUE INDEX "SaleEvent_slug_key" ON "SaleEvent"("slug");

-- CreateIndex
CREATE INDEX "PageSection_page_sortOrder_idx" ON "PageSection"("page", "sortOrder");

-- CreateIndex
CREATE UNIQUE INDEX "_SaleEventProducts_AB_unique" ON "_SaleEventProducts"("A", "B");

-- CreateIndex
CREATE INDEX "_SaleEventProducts_B_index" ON "_SaleEventProducts"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_SaleEventCategories_AB_unique" ON "_SaleEventCategories"("A", "B");

-- CreateIndex
CREATE INDEX "_SaleEventCategories_B_index" ON "_SaleEventCategories"("B");

-- CreateIndex
CREATE INDEX "Product_categoryId_idx" ON "Product"("categoryId");

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Category" ADD CONSTRAINT "Category_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "Category"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_SaleEventProducts" ADD CONSTRAINT "_SaleEventProducts_A_fkey" FOREIGN KEY ("A") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_SaleEventProducts" ADD CONSTRAINT "_SaleEventProducts_B_fkey" FOREIGN KEY ("B") REFERENCES "SaleEvent"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_SaleEventCategories" ADD CONSTRAINT "_SaleEventCategories_A_fkey" FOREIGN KEY ("A") REFERENCES "Category"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_SaleEventCategories" ADD CONSTRAINT "_SaleEventCategories_B_fkey" FOREIGN KEY ("B") REFERENCES "SaleEvent"("id") ON DELETE CASCADE ON UPDATE CASCADE;


-- ---------------------------------------------------------------------------
-- Data: výchozí strom kategorií a převod stávajících produktů
-- ---------------------------------------------------------------------------
INSERT INTO "Category" ("id", "name", "slug", "parentId", "sizeType", "sortOrder", "isVisible", "updatedAt") VALUES
  ('cat_zeny',          'Ženy',                 'zeny',                 NULL,              NULL,        1, true, CURRENT_TIMESTAMP),
  ('cat_muzi',          'Muži',                 'muzi',                 NULL,              NULL,        2, true, CURRENT_TIMESTAMP),
  ('cat_deti',          'Děti',                 'deti',                 NULL,              NULL,        3, true, CURRENT_TIMESTAMP),
  ('cat_zeny_pradlo',   'Spodní prádlo',        'zeny-spodni-pradlo',   'cat_zeny',        NULL,        1, true, CURRENT_TIMESTAMP),
  ('cat_zeny_obleceni', 'Oblečení',             'zeny-obleceni',        'cat_zeny',        'clothing',  2, true, CURRENT_TIMESTAMP),
  ('cat_bra_wired',     'Podprsenky s kosticí', 'podprsenky-s-kostici', 'cat_zeny_pradlo', 'bra_wired', 1, true, CURRENT_TIMESTAMP),
  ('cat_bralette',      'Braletky',             'braletky',             'cat_zeny_pradlo', 'bralette',  2, true, CURRENT_TIMESTAMP),
  ('cat_panties',       'Kalhotky',             'kalhotky',             'cat_zeny_pradlo', 'panties',   3, true, CURRENT_TIMESTAMP),
  ('cat_garters',       'Podvazky',             'podvazky',             'cat_zeny_pradlo', 'panties',   4, true, CURRENT_TIMESTAMP),
  ('cat_sets',          'Sety',                 'sety',                 'cat_zeny_pradlo', 'set',       5, true, CURRENT_TIMESTAMP),
  ('cat_zeny_ostatni',  'Ostatní',              'zeny-ostatni',         'cat_zeny',        'none',      9, true, CURRENT_TIMESTAMP),
  ('cat_muzi_pradlo',   'Spodní prádlo',        'muzi-spodni-pradlo',   'cat_muzi',        'clothing',  1, true, CURRENT_TIMESTAMP),
  ('cat_muzi_obleceni', 'Oblečení',             'muzi-obleceni',        'cat_muzi',        'clothing',  2, true, CURRENT_TIMESTAMP),
  ('cat_deti_obleceni', 'Oblečení',             'deti-obleceni',        'cat_deti',        'kids',      1, true, CURRENT_TIMESTAMP)
ON CONFLICT ("id") DO NOTHING;

UPDATE "Product" SET "categoryId" = CASE "category"
    WHEN 'Podprsenka s kosticí' THEN 'cat_bra_wired'
    WHEN 'Braletka'             THEN 'cat_bralette'
    WHEN 'Kalhotky'             THEN 'cat_panties'
    WHEN 'Podvazky'             THEN 'cat_garters'
    WHEN 'Set'                  THEN 'cat_sets'
    WHEN 'Ostatní'              THEN 'cat_zeny_ostatni'
    ELSE NULL
  END
WHERE "categoryId" IS NULL;

-- Sety se poznají i podle příznaku isSet
UPDATE "Product" SET "categoryId" = 'cat_sets' WHERE "isSet" = true AND "categoryId" IS NULL;
