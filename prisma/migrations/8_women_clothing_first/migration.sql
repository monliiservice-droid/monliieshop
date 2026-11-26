-- Ženy: v menu nejdřív Oblečení, pak Spodní prádlo
UPDATE "Category" SET "sortOrder" = 1 WHERE slug = 'zeny-obleceni';
UPDATE "Category" SET "sortOrder" = 2 WHERE slug = 'zeny-spodni-pradlo';
