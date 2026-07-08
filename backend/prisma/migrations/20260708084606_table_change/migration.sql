/*
  Warnings:

  - A unique constraint covering the columns `[name]` on the table `tables` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "tables_name_key" ON "tables"("name");
