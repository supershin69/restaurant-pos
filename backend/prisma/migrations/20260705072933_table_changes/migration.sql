/*
  Warnings:

  - You are about to drop the `promotion_item` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "promotion_item" DROP CONSTRAINT "promotion_item_food_id_fkey";

-- DropForeignKey
ALTER TABLE "promotion_item" DROP CONSTRAINT "promotion_item_promotion_id_fkey";

-- DropTable
DROP TABLE "promotion_item";

-- CreateTable
CREATE TABLE "promotion_items" (
    "id" TEXT NOT NULL,
    "promotion_id" TEXT NOT NULL,
    "food_id" TEXT NOT NULL,
    "discount_price" INTEGER NOT NULL,

    CONSTRAINT "promotion_items_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "promotion_items" ADD CONSTRAINT "promotion_items_promotion_id_fkey" FOREIGN KEY ("promotion_id") REFERENCES "promotions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "promotion_items" ADD CONSTRAINT "promotion_items_food_id_fkey" FOREIGN KEY ("food_id") REFERENCES "foods"("id") ON DELETE CASCADE ON UPDATE CASCADE;
