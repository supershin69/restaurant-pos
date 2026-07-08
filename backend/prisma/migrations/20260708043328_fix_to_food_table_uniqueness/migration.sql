/*
  Warnings:

  - A unique constraint covering the columns `[name,is_deleted]` on the table `foods` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "foods_name_is_deleted_key" ON "foods"("name", "is_deleted");
