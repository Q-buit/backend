/*
  Warnings:

  - You are about to drop the column `followUps` on the `Question` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."Question" DROP COLUMN "followUps";

-- CreateTable
CREATE TABLE "public"."QuestionFollowUp" (
    "id" SERIAL NOT NULL,
    "questionId" INTEGER NOT NULL,
    "followUpQuestionId" INTEGER NOT NULL,
    "displayOrder" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "QuestionFollowUp_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "QuestionFollowUp_questionId_followUpQuestionId_key" ON "public"."QuestionFollowUp"("questionId", "followUpQuestionId");

-- CreateIndex
CREATE UNIQUE INDEX "QuestionFollowUp_questionId_displayOrder_key" ON "public"."QuestionFollowUp"("questionId", "displayOrder");

-- AddForeignKey
ALTER TABLE "public"."QuestionFollowUp" ADD CONSTRAINT "QuestionFollowUp_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "public"."Question"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."QuestionFollowUp" ADD CONSTRAINT "QuestionFollowUp_followUpQuestionId_fkey" FOREIGN KEY ("followUpQuestionId") REFERENCES "public"."Question"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
