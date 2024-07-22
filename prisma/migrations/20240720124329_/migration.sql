/*
  Warnings:

  - A unique constraint covering the columns `[checksum]` on the table `File` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `checksum` to the `File` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "File" ADD COLUMN     "checksum" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "File_checksum_key" ON "File"("checksum");
