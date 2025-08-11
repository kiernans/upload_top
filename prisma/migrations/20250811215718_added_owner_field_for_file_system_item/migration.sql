-- AlterTable
ALTER TABLE "public"."FileSystemItem" ADD COLUMN     "ownerId" INTEGER;

-- AddForeignKey
ALTER TABLE "public"."FileSystemItem" ADD CONSTRAINT "FileSystemItem_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
