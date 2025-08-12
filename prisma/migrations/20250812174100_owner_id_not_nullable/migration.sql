/*
  Warnings:

  - Made the column `ownerId` on table `FileSystemItem` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "public"."FileSystemItem" ALTER COLUMN "ownerId" SET NOT NULL;
