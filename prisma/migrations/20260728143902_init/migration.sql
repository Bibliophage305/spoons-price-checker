-- CreateTable
CREATE TABLE "CachedRequest" (
    "id" TEXT NOT NULL,
    "requestHash" TEXT NOT NULL,
    "method" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CachedRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CachedResponse" (
    "id" TEXT NOT NULL,
    "requestId" TEXT NOT NULL,
    "statusCode" INTEGER NOT NULL,
    "headers" JSONB NOT NULL,
    "body" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CachedResponse_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CachedRequest_requestHash_key" ON "CachedRequest"("requestHash");

-- CreateIndex
CREATE INDEX "CachedResponse_requestId_createdAt_idx" ON "CachedResponse"("requestId", "createdAt");

-- AddForeignKey
ALTER TABLE "CachedResponse" ADD CONSTRAINT "CachedResponse_requestId_fkey" FOREIGN KEY ("requestId") REFERENCES "CachedRequest"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
