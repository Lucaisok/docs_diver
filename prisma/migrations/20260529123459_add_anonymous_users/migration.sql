-- AlterTable
ALTER TABLE "User" ADD COLUMN     "expiresAt" TIMESTAMP(3),
ADD COLUMN     "isAnonymous" BOOLEAN NOT NULL DEFAULT false;
