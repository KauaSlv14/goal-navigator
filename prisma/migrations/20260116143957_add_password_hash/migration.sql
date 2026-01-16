-- Add column as nullable temporarily
ALTER TABLE "User" ADD COLUMN "passwordHash" TEXT;

-- Backfill existing users with placeholder (should be updated with real hashes on next login/registro)
UPDATE "User" SET "passwordHash" = 'temp';

-- Enforce not null
ALTER TABLE "User" ALTER COLUMN "passwordHash" SET NOT NULL;
