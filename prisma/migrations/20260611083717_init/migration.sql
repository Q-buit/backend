-- CreateEnum
CREATE TYPE "public"."Track" AS ENUM ('frontend', 'backend');

-- CreateEnum
CREATE TYPE "public"."QuestionType" AS ENUM ('concept', 'experience');

-- CreateEnum
CREATE TYPE "public"."AnswerFramework" AS ENUM ('PREP', 'STAR');

-- CreateEnum
CREATE TYPE "public"."SubscriptionStatus" AS ENUM ('pending', 'active', 'dormant', 'unsubscribed');

-- CreateEnum
CREATE TYPE "public"."DeliveryStatus" AS ENUM ('queued', 'sent', 'failed');

-- CreateEnum
CREATE TYPE "public"."TokenType" AS ENUM ('verify', 'manage', 'unsubscribe');

-- CreateTable
CREATE TABLE "public"."Subscriber" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "status" "public"."SubscriptionStatus" NOT NULL,
    "consentToReceive" BOOLEAN NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Subscriber_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."SubscriberTrack" (
    "id" SERIAL NOT NULL,
    "subscriberId" INTEGER NOT NULL,
    "track" "public"."Track" NOT NULL,
    "status" "public"."SubscriptionStatus" NOT NULL,
    "currentQuestionOrder" INTEGER NOT NULL DEFAULT 1,
    "lastClickedAt" TIMESTAMP(3),
    "activatedAt" TIMESTAMP(3),
    "dormantAt" TIMESTAMP(3),
    "unsubscribedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SubscriberTrack_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Question" (
    "id" SERIAL NOT NULL,
    "track" "public"."Track" NOT NULL,
    "category" TEXT NOT NULL,
    "questionType" "public"."QuestionType" NOT NULL,
    "recommendedFramework" "public"."AnswerFramework" NOT NULL,
    "title" TEXT NOT NULL,
    "questionText" TEXT NOT NULL,
    "conceptSummary" TEXT NOT NULL,
    "modelAnswer" TEXT NOT NULL,
    "followUps" JSONB NOT NULL,
    "questionOrder" INTEGER NOT NULL,
    "isPublished" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Question_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Delivery" (
    "id" SERIAL NOT NULL,
    "subscriberTrackId" INTEGER NOT NULL,
    "questionId" INTEGER NOT NULL,
    "status" "public"."DeliveryStatus" NOT NULL,
    "sentAt" TIMESTAMP(3),
    "clickedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Delivery_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."SubscriptionToken" (
    "id" SERIAL NOT NULL,
    "subscriberId" INTEGER NOT NULL,
    "type" "public"."TokenType" NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "usedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SubscriptionToken_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Subscriber_email_key" ON "public"."Subscriber"("email");

-- CreateIndex
CREATE UNIQUE INDEX "SubscriberTrack_subscriberId_track_key" ON "public"."SubscriberTrack"("subscriberId", "track");

-- CreateIndex
CREATE UNIQUE INDEX "Question_track_questionOrder_key" ON "public"."Question"("track", "questionOrder");

-- CreateIndex
CREATE UNIQUE INDEX "SubscriptionToken_tokenHash_key" ON "public"."SubscriptionToken"("tokenHash");

-- AddForeignKey
ALTER TABLE "public"."SubscriberTrack" ADD CONSTRAINT "SubscriberTrack_subscriberId_fkey" FOREIGN KEY ("subscriberId") REFERENCES "public"."Subscriber"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Delivery" ADD CONSTRAINT "Delivery_subscriberTrackId_fkey" FOREIGN KEY ("subscriberTrackId") REFERENCES "public"."SubscriberTrack"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Delivery" ADD CONSTRAINT "Delivery_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "public"."Question"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."SubscriptionToken" ADD CONSTRAINT "SubscriptionToken_subscriberId_fkey" FOREIGN KEY ("subscriberId") REFERENCES "public"."Subscriber"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
