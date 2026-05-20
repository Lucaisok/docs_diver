/*
  Warnings:

  - The `usedChunks` column on the `AIRequestLog` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "AIRequestLog" ADD COLUMN     "retrievedChunks" JSONB,
DROP COLUMN "usedChunks",
ADD COLUMN     "usedChunks" JSONB;
