-- AlterTable
ALTER TABLE "Submission" ADD COLUMN     "feedback" TEXT,
ADD COLUMN     "grade" DOUBLE PRECISION,
ADD COLUMN     "gradedAt" TIMESTAMP(3),
ADD COLUMN     "gradedBy" TEXT,
ADD COLUMN     "testsPassed" INTEGER,
ADD COLUMN     "totalTests" INTEGER;
