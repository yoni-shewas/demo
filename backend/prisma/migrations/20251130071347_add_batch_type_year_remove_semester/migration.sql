/*
  Warnings:

  - You are about to drop the column `semester` on the `Section` table. All the data in the column will be lost.
  - Added the required column `type` to the `Batch` table without a default value. This is not possible if the table is not empty.
  - Added the required column `year` to the `Batch` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Section" DROP CONSTRAINT "Section_instructorId_fkey";

-- AlterTable
ALTER TABLE "Batch" ADD COLUMN     "type" TEXT NOT NULL,
ADD COLUMN     "year" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "Section" DROP COLUMN "semester",
ALTER COLUMN "instructorId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Section" ADD CONSTRAINT "Section_instructorId_fkey" FOREIGN KEY ("instructorId") REFERENCES "Instructor"("id") ON DELETE SET NULL ON UPDATE CASCADE;
