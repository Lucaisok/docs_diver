-- AlterTable
ALTER TABLE "Document" ADD COLUMN     "isDemo" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "Workspace" ADD COLUMN     "isDemo" BOOLEAN NOT NULL DEFAULT false;
