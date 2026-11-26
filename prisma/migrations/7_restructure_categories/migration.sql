-- Přestavba kategorií e-shopu monlii.cz (listopad 2026):
--   Ženy › Spodní prádlo › Podprsenky, Kalhotky, Sety, Košilky
--   Ženy › Oblečení › Trička, halenky a body
--   Muži a Děti – „Připravujeme“
-- Produkty se hledají podle názvu; v databázi, kde nejsou (vývoj, testy), migrace nic nezmění.

-- 1) Přesouvané produkty si ponechají dosavadní typ velikostí (jinak by se po přesunu mohly změnit
--    nabízené velikosti a sklad po variantách by přestal sedět)
WITH RECURSIVE chain AS (
  SELECT p.id AS pid, c."parentId" AS parent, c."sizeType" AS st, 0 AS depth
  FROM "Product" p JOIN "Category" c ON c.id = p."categoryId"
  WHERE lower(trim(p.name)) IN ('podprsenka mia', 'podprsenka rosalie', 'kalhotky mia', 'kalhotky rosalie',
                                'set cotto trio (3ks)', 'košilka noemi', 'košilka luna veil')
    AND p."sizeType" IS NULL AND p."isSet" = false
  UNION ALL
  SELECT chain.pid, c."parentId", c."sizeType", chain.depth + 1
  FROM chain JOIN "Category" c ON c.id = chain.parent
  WHERE chain.st IS NULL
)
UPDATE "Product" p
SET "sizeType" = COALESCE((SELECT st FROM chain WHERE chain.pid = p.id AND st IS NOT NULL ORDER BY depth LIMIT 1), 'none')
WHERE p.id IN (SELECT pid FROM chain);

UPDATE "Product" SET "sizeType" = 'none'
WHERE lower(trim(name)) IN ('podprsenka mia', 'podprsenka rosalie', 'kalhotky mia', 'kalhotky rosalie',
                            'set cotto trio (3ks)', 'košilka noemi', 'košilka luna veil')
  AND "categoryId" IS NULL AND "sizeType" IS NULL AND "isSet" = false;

-- 2) Podkategorie spodního prádla (založí se, jen pokud ještě neexistují)
INSERT INTO "Category" ("id", "name", "slug", "parentId", "sizeType", "sortOrder", "isVisible", "comingSoon", "updatedAt")
SELECT v.id, v.name, v.slug, parent.id, NULL, v.sort, true, false, CURRENT_TIMESTAMP
FROM (VALUES ('cat_podprsenky', 'Podprsenky', 'podprsenky', 1),
             ('cat_kalhotky', 'Kalhotky', 'kalhotky', 2),
             ('cat_kosilky', 'Košilky', 'kosilky', 4)) AS v(id, name, slug, sort)
JOIN "Category" parent ON parent.slug = 'zeny-spodni-pradlo'
WHERE NOT EXISTS (SELECT 1 FROM "Category" c WHERE c.slug = v.slug OR c.id = v.id);

UPDATE "Category" c
SET "parentId" = parent.id, "isVisible" = true, "comingSoon" = false,
    "sortOrder" = CASE c.slug WHEN 'podprsenky' THEN 1 WHEN 'kalhotky' THEN 2 WHEN 'sety' THEN 3 ELSE 4 END,
    "updatedAt" = CURRENT_TIMESTAMP
FROM "Category" parent
WHERE parent.slug = 'zeny-spodni-pradlo' AND c.slug IN ('podprsenky', 'kalhotky', 'sety', 'kosilky');

-- 3) Ženy: Spodní prádlo, pak Oblečení s trička/halenkami/body; prázdné „Ostatní“ skrýt
UPDATE "Category" SET "sortOrder" = 1, "isVisible" = true WHERE slug = 'zeny-spodni-pradlo';
UPDATE "Category" SET "sortOrder" = 2, "isVisible" = true WHERE slug = 'zeny-obleceni';

UPDATE "Category" c
SET "parentId" = parent.id, "name" = 'Trička, halenky a body', "sortOrder" = 1, "isVisible" = true,
    "updatedAt" = CURRENT_TIMESTAMP
FROM "Category" parent
WHERE parent.slug = 'zeny-obleceni' AND c.slug = 'halenky-a-tricka';

UPDATE "Category" SET "isVisible" = false
WHERE slug = 'zeny-ostatni'
  AND NOT EXISTS (SELECT 1 FROM "Product" p WHERE p."categoryId" = "Category".id);

-- 4) Muži a Děti zatím připravujeme
UPDATE "Category" SET "comingSoon" = true WHERE slug IN ('muzi', 'deti');

-- 5) Přesun produktů
UPDATE "Product" SET "categoryId" = c.id
FROM "Category" c
WHERE c.slug = 'podprsenky' AND lower(trim("Product".name)) IN ('podprsenka mia', 'podprsenka rosalie');

UPDATE "Product" SET "categoryId" = c.id
FROM "Category" c
WHERE c.slug = 'kalhotky' AND lower(trim("Product".name)) IN ('kalhotky mia', 'kalhotky rosalie', 'set cotto trio (3ks)');

UPDATE "Product" SET "categoryId" = c.id
FROM "Category" c
WHERE c.slug = 'kosilky' AND lower(trim("Product".name)) IN ('košilka noemi', 'košilka luna veil');
