ALTER TABLE "Resturants" ADD COLUMN "userId" TEXT;

UPDATE "Resturants" r
SET "userId" = u."id"
FROM "User" u
WHERE u."resturantsId" = r."id";

ALTER TABLE "Resturants" ALTER COLUMN "userId" SET NOT NULL;
ALTER TABLE "Resturants" ADD CONSTRAINT "Resturants_userId_key" UNIQUE ("userId");
ALTER TABLE "Resturants" ADD CONSTRAINT "Resturants_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "User" DROP CONSTRAINT IF EXISTS "User_resturantsId_fkey";
ALTER TABLE "User" DROP COLUMN IF EXISTS "resturantsId";

CREATE TABLE "AuditLog" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "resturantId" TEXT NOT NULL,
  "action" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "AuditLog_userId_idx" ON "AuditLog"("userId");
CREATE INDEX IF NOT EXISTS "AuditLog_resturantId_idx" ON "AuditLog"("resturantId");