-- CreateEnum
CREATE TYPE "MenuCategory" AS ENUM ('HOT_DRINK', 'COLD_DRINK', 'ALCOHOLIC_DRINK', 'VEGAN_FOOD', 'CHINESE', 'NEPALI', 'THAI', 'CONTINENTAL');

-- CreateEnum
CREATE TYPE "QuantityType" AS ENUM ('SERVING', 'HALF_SERVING', 'FULL_SERVING', 'HALF_PLATE', 'FULL_PLATE');

-- CreateTable
CREATE TABLE "MenuItem" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "price" DOUBLE PRECISION NOT NULL,
    "category" "MenuCategory" NOT NULL,
    "quantityType" "QuantityType" NOT NULL,
    "imageUrl" TEXT,
    "isAvailable" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MenuItem_pkey" PRIMARY KEY ("id")
);
