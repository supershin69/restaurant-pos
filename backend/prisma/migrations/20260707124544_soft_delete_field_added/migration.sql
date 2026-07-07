-- AlterTable
ALTER TABLE "foods" ADD COLUMN     "deleted_at" TIMESTAMP(3),
ADD COLUMN     "is_deleted" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "orders" ADD COLUMN     "deleted_at" TIMESTAMP(3),
ADD COLUMN     "is_deleted" BOOLEAN NOT NULL DEFAULT false;
