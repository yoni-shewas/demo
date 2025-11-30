-- AlterTable
ALTER TABLE "Assignment" ADD COLUMN     "constraints" TEXT,
ADD COLUMN     "examples" JSONB,
ADD COLUMN     "testDriver" JSONB;
