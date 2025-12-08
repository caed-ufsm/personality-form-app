-- CreateTable
CREATE TABLE "public"."UserResult" (
    "id" UUID NOT NULL,
    "sessionId" VARCHAR(100) NOT NULL,
    "results" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserResult_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "UserResult_sessionId_key" ON "public"."UserResult"("sessionId");
