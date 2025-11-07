-- CreateEnum
CREATE TYPE "SubmissionStatus" AS ENUM ('PENDING', 'COMPLETED', 'FAILED', 'REVIEWED');

-- AlterTable
ALTER TABLE "Assignment" ADD COLUMN     "submissionStatus" "SubmissionStatus" NOT NULL DEFAULT 'PENDING';
