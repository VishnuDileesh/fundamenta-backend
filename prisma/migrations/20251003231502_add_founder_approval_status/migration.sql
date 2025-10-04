-- CreateEnum
CREATE TYPE "FounderApprovalStatus" AS ENUM ('pending', 'approved', 'rejected');

-- AlterTable
ALTER TABLE "FounderProfile" ADD COLUMN     "approvalStatus" "FounderApprovalStatus" NOT NULL DEFAULT 'pending',
ADD COLUMN     "rejectedAt" TIMESTAMP(3);
