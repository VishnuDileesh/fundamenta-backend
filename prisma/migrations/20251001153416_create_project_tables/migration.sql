-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('founder', 'investor', 'admin');

-- CreateEnum
CREATE TYPE "InvestorApprovalStatus" AS ENUM ('pending', 'approved', 'rejected');

-- CreateEnum
CREATE TYPE "BusinessStage" AS ENUM ('idea', 'mvp', 'launched', 'scaling');

-- CreateEnum
CREATE TYPE "BusinessApprovalStatus" AS ENUM ('pending', 'approved', 'rejected');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" "UserRole" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FounderProfile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "bio" TEXT NOT NULL,
    "approvedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FounderProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InvestorProfile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "bio" TEXT NOT NULL,
    "investmentFocus" TEXT NOT NULL,
    "minInvestment" DOUBLE PRECISION NOT NULL,
    "maxInvestment" DOUBLE PRECISION NOT NULL,
    "approvalStatus" "InvestorApprovalStatus" NOT NULL DEFAULT 'pending',
    "approvedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "InvestorProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AdminProfile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AdminProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BusinessIdea" (
    "id" TEXT NOT NULL,
    "founderProfileId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "industry" TEXT NOT NULL,
    "stage" "BusinessStage" NOT NULL DEFAULT 'idea',
    "problemStatement" TEXT NOT NULL,
    "solution" TEXT NOT NULL,
    "targetMarket" TEXT NOT NULL,
    "businessModel" TEXT NOT NULL,
    "competitiveAdvantage" TEXT,
    "fundingSought" DOUBLE PRECISION NOT NULL,
    "fundingUse" TEXT NOT NULL,
    "approvalStatus" "BusinessApprovalStatus" NOT NULL DEFAULT 'pending',
    "approvedAt" TIMESTAMP(3),
    "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BusinessIdea_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AIAnalysis" (
    "id" TEXT NOT NULL,
    "businessIdeaId" TEXT NOT NULL,
    "marketPotentialScore" DOUBLE PRECISION,
    "innovationScore" DOUBLE PRECISION,
    "feasibilityScore" DOUBLE PRECISION,
    "financialViabilityScore" DOUBLE PRECISION,
    "overallScore" DOUBLE PRECISION,
    "strengthsArray" JSONB,
    "weaknessesArray" JSONB,
    "opportunitiesArray" JSONB,
    "risksArray" JSONB,
    "marketSizeData" JSONB,
    "competitorAnalysis" JSONB,
    "recommendation" TEXT,
    "generatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AIAnalysis_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InvestorInterest" (
    "id" TEXT NOT NULL,
    "investorProfileId" TEXT NOT NULL,
    "businessIdeaId" TEXT NOT NULL,
    "bookmarkedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "InvestorInterest_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "FounderProfile_userId_key" ON "FounderProfile"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "InvestorProfile_userId_key" ON "InvestorProfile"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "AdminProfile_userId_key" ON "AdminProfile"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "AIAnalysis_businessIdeaId_key" ON "AIAnalysis"("businessIdeaId");

-- CreateIndex
CREATE UNIQUE INDEX "InvestorInterest_investorProfileId_businessIdeaId_key" ON "InvestorInterest"("investorProfileId", "businessIdeaId");

-- AddForeignKey
ALTER TABLE "FounderProfile" ADD CONSTRAINT "FounderProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InvestorProfile" ADD CONSTRAINT "InvestorProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AdminProfile" ADD CONSTRAINT "AdminProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BusinessIdea" ADD CONSTRAINT "BusinessIdea_founderProfileId_fkey" FOREIGN KEY ("founderProfileId") REFERENCES "FounderProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AIAnalysis" ADD CONSTRAINT "AIAnalysis_businessIdeaId_fkey" FOREIGN KEY ("businessIdeaId") REFERENCES "BusinessIdea"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InvestorInterest" ADD CONSTRAINT "InvestorInterest_investorProfileId_fkey" FOREIGN KEY ("investorProfileId") REFERENCES "InvestorProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InvestorInterest" ADD CONSTRAINT "InvestorInterest_businessIdeaId_fkey" FOREIGN KEY ("businessIdeaId") REFERENCES "BusinessIdea"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
