/*
  Warnings:

  - The values [PREPARING,SERVED] on the enum `OrderStatus` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `name` on the `Category` table. All the data in the column will be lost.
  - You are about to drop the column `imageUrl` on the `MenuItem` table. All the data in the column will be lost.
  - You are about to drop the column `waiterId` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the column `menuItemUnitId` on the `OrderItem` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `OrderItem` table. All the data in the column will be lost.
  - You are about to drop the column `portion` on the `OrderItem` table. All the data in the column will be lost.
  - You are about to drop the `MenuItemUnit` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_CategoryToMenuItem` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `category` to the `Category` table without a default value. This is not possible if the table is not empty.
  - Added the required column `categoryId` to the `MenuItem` table without a default value. This is not possible if the table is not empty.
  - Made the column `resturantID` on table `MenuItem` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `finalAmount` to the `Order` table without a default value. This is not possible if the table is not empty.
  - Added the required column `unitName` to the `OrderItem` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `OrderItem` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'PAID', 'FAILED');

-- CreateEnum
CREATE TYPE "PaymentMethod" AS ENUM ('CASH', 'ONLINE');

-- AlterEnum
BEGIN;
CREATE TYPE "OrderStatus_new" AS ENUM ('PENDING', 'COOKING', 'READY', 'COMPLETED', 'CANCELLED');
ALTER TABLE "public"."Order" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "Order" ALTER COLUMN "status" TYPE "OrderStatus_new" USING ("status"::text::"OrderStatus_new");
ALTER TYPE "OrderStatus" RENAME TO "OrderStatus_old";
ALTER TYPE "OrderStatus_new" RENAME TO "OrderStatus";
DROP TYPE "public"."OrderStatus_old";
ALTER TABLE "Order" ALTER COLUMN "status" SET DEFAULT 'PENDING';
COMMIT;

-- DropForeignKey
ALTER TABLE "MenuItem" DROP CONSTRAINT "MenuItem_resturantID_fkey";

-- DropForeignKey
ALTER TABLE "MenuItemUnit" DROP CONSTRAINT "MenuItemUnit_menuItemId_fkey";

-- DropForeignKey
ALTER TABLE "Order" DROP CONSTRAINT "Order_resturantID_fkey";

-- DropForeignKey
ALTER TABLE "Order" DROP CONSTRAINT "Order_waiterId_fkey";

-- DropForeignKey
ALTER TABLE "OrderItem" DROP CONSTRAINT "OrderItem_menuItemUnitId_fkey";

-- DropForeignKey
ALTER TABLE "OrderItem" DROP CONSTRAINT "OrderItem_orderId_fkey";

-- DropForeignKey
ALTER TABLE "_CategoryToMenuItem" DROP CONSTRAINT "_CategoryToMenuItem_A_fkey";

-- DropForeignKey
ALTER TABLE "_CategoryToMenuItem" DROP CONSTRAINT "_CategoryToMenuItem_B_fkey";

-- AlterTable
ALTER TABLE "Category" DROP COLUMN "name",
ADD COLUMN     "category" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "MenuItem" DROP COLUMN "imageUrl",
ADD COLUMN     "categoryId" TEXT NOT NULL,
ALTER COLUMN "resturantID" SET NOT NULL;

-- AlterTable
ALTER TABLE "Order" DROP COLUMN "waiterId",
ADD COLUMN     "customerEmail" TEXT,
ADD COLUMN     "finalAmount" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "isPaid" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "paidAt" TIMESTAMP(3),
ADD COLUMN     "userId" TEXT,
ALTER COLUMN "resturantID" DROP NOT NULL;

-- AlterTable
ALTER TABLE "OrderItem" DROP COLUMN "menuItemUnitId",
DROP COLUMN "name",
DROP COLUMN "portion",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "unitName" TEXT NOT NULL,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- DropTable
DROP TABLE "MenuItemUnit";

-- DropTable
DROP TABLE "_CategoryToMenuItem";

-- CreateTable
CREATE TABLE "Unit" (
    "id" TEXT NOT NULL,
    "menuItemId" TEXT NOT NULL,
    "unit" TEXT NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "Unit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Bill" (
    "id" TEXT NOT NULL,
    "billNumber" SERIAL NOT NULL,
    "orderId" TEXT NOT NULL,
    "totalAmount" DOUBLE PRECISION NOT NULL,
    "paymentStatus" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "paymentMethod" "PaymentMethod",
    "amountTendered" DOUBLE PRECISION,
    "changeGiven" DOUBLE PRECISION,
    "paidAt" TIMESTAMP(3),
    "transactionId" TEXT,
    "paymentProcessedById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Bill_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Image" (
    "id" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "menuItemId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Image_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Bill_billNumber_key" ON "Bill"("billNumber");

-- CreateIndex
CREATE UNIQUE INDEX "Bill_orderId_key" ON "Bill"("orderId");

-- AddForeignKey
ALTER TABLE "MenuItem" ADD CONSTRAINT "MenuItem_resturantID_fkey" FOREIGN KEY ("resturantID") REFERENCES "Resturants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MenuItem" ADD CONSTRAINT "MenuItem_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Unit" ADD CONSTRAINT "Unit_menuItemId_fkey" FOREIGN KEY ("menuItemId") REFERENCES "MenuItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_resturantID_fkey" FOREIGN KEY ("resturantID") REFERENCES "Resturants"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderItem" ADD CONSTRAINT "OrderItem_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Bill" ADD CONSTRAINT "Bill_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Bill" ADD CONSTRAINT "Bill_paymentProcessedById_fkey" FOREIGN KEY ("paymentProcessedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Image" ADD CONSTRAINT "Image_menuItemId_fkey" FOREIGN KEY ("menuItemId") REFERENCES "MenuItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;
