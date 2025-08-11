-- CreateEnum
CREATE TYPE "public"."ItemType" AS ENUM ('FILE', 'FOLDER');

-- CreateTable
CREATE TABLE "public"."FileSystemItem" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "public"."ItemType" NOT NULL,
    "parentId" TEXT,
    "uploadTime" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "mimeType" TEXT,
    "size" INTEGER,
    "url" TEXT NOT NULL,

    CONSTRAINT "FileSystemItem_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."FileSystemItem" ADD CONSTRAINT "FileSystemItem_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "public"."FileSystemItem"("id") ON DELETE SET NULL ON UPDATE CASCADE;
