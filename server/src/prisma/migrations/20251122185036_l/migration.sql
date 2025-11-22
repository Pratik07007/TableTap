-- AlterTable
ALTER TABLE "MenuItem" ADD COLUMN     "restaurantId" TEXT;

-- CreateIndex
CREATE INDEX "MenuItem_restaurantId_idx" ON "MenuItem"("restaurantId");

-- AddForeignKey
ALTER TABLE "MenuItem" ADD CONSTRAINT "MenuItem_restaurantId_fkey" FOREIGN KEY ("restaurantId") REFERENCES "Resturants"("id") ON DELETE SET NULL ON UPDATE CASCADE;
