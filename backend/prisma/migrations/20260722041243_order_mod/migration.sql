/*
  Warnings:

  - Added the required column `status` to the `order_items` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "Status" AS ENUM ('PLACED', 'CANCELLED');

-- AlterTable
ALTER TABLE "order_items" ADD COLUMN     "status" "Status" NOT NULL;
