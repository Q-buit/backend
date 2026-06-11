import { PrismaClient } from "@prisma/client";
import { questionFollowUpLinks, questions } from "../src/data/mock-data.js";

const prisma = new PrismaClient();

async function main() {
  await prisma.questionFollowUp.deleteMany();
  await prisma.delivery.deleteMany();
  await prisma.question.deleteMany();

  await prisma.question.createMany({
    data: questions.map((question) => ({
      id: question.id,
      track: question.track,
      category: question.category,
      questionType: question.questionType,
      recommendedFramework: question.recommendedFramework,
      title: question.title,
      questionText: question.questionText,
      conceptSummary: question.conceptSummary,
      modelAnswer: question.modelAnswer,
      questionOrder: question.questionOrder,
      isPublished: question.isPublished,
    })),
  });

  await prisma.questionFollowUp.createMany({
    data: questionFollowUpLinks.map((link) => ({
      id: link.id,
      questionId: link.questionId,
      followUpQuestionId: link.followUpQuestionId,
      displayOrder: link.displayOrder,
    })),
  });
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
