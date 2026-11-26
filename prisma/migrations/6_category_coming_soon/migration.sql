-- Kolekce, kterou připravujeme (štítek v menu, stránka „Připravujeme“)
ALTER TABLE "Category" ADD COLUMN "comingSoon" BOOLEAN NOT NULL DEFAULT false;
