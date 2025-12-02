-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Order" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "orderNumber" TEXT NOT NULL,
    "customerName" TEXT NOT NULL,
    "customerEmail" TEXT NOT NULL,
    "customerPhone" TEXT,
    "shippingAddress" TEXT NOT NULL,
    "billingAddress" TEXT,
    "totalAmount" REAL NOT NULL,
    "discountCode" TEXT,
    "discountAmount" REAL NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'new',
    "paymentMethod" TEXT NOT NULL,
    "paymentStatus" TEXT NOT NULL DEFAULT 'pending',
    "shippingMethod" TEXT NOT NULL,
    "trackingNumber" TEXT,
    "stripePaymentId" TEXT,
    "reviewEmailSentAt" DATETIME,
    "deliveredAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Order" ("billingAddress", "createdAt", "customerEmail", "customerName", "customerPhone", "discountAmount", "discountCode", "id", "orderNumber", "paymentMethod", "paymentStatus", "shippingAddress", "shippingMethod", "status", "stripePaymentId", "totalAmount", "trackingNumber", "updatedAt") SELECT "billingAddress", "createdAt", "customerEmail", "customerName", "customerPhone", "discountAmount", "discountCode", "id", "orderNumber", "paymentMethod", "paymentStatus", "shippingAddress", "shippingMethod", "status", "stripePaymentId", "totalAmount", "trackingNumber", "updatedAt" FROM "Order";
DROP TABLE "Order";
ALTER TABLE "new_Order" RENAME TO "Order";
CREATE UNIQUE INDEX "Order_orderNumber_key" ON "Order"("orderNumber");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
