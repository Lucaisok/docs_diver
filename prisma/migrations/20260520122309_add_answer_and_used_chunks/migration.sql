/*
  Warnings:

  - Added the required column `answer` to the `AIRequestLog` table without a default value. This is not possible if the table is not empty.
  - Added the required column `usedChunks` to the `AIRequestLog` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "AIRequestLog" ADD COLUMN     "answer" TEXT NOT NULL,
ADD COLUMN     "usedChunks" INTEGER NOT NULL;
