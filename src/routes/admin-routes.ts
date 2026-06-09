import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { QuestionRepository } from "../repositories/question-repository.js";
import { QuestionService } from "../services/question-service.js";

const adminQuestionSchema = z.object({
  track: z.enum(["frontend", "backend"]),
  category: z.string().min(1),
  questionType: z.enum(["concept", "experience"]),
  recommendedFramework: z.enum(["PREP", "STAR"]),
  title: z.string().min(1),
  questionText: z.string().min(1),
  conceptSummary: z.string().min(1),
  modelAnswer: z.string().min(1),
  followUps: z
    .array(
      z.object({
        question: z.string().min(1),
        answer: z.string().min(1),
      }),
    )
    .default([]),
});

export async function registerAdminRoutes(app: FastifyInstance) {
  const questionService = new QuestionService(new QuestionRepository());

  app.get("/admin/questions", async () => {
    return questionService.listQuestions();
  });

  app.post("/admin/questions", async (request, reply) => {
    const payload = adminQuestionSchema.safeParse(request.body);

    if (!payload.success) {
      return reply.code(400).send({
        message: "질문 생성 요청 형식이 올바르지 않습니다.",
        issues: payload.error.issues,
      });
    }

    const question = questionService.createQuestion(payload.data);

    return reply.code(201).send({
      message: "질문을 저장했습니다.",
      data: question,
    });
  });

  app.patch<{ Params: { id: string } }>("/admin/questions/:id", async (request, reply) => {
    const payload = adminQuestionSchema.partial().extend({
      isPublished: z.boolean().optional(),
    }).safeParse(request.body);

    if (!payload.success) {
      return reply.code(400).send({
        message: "질문 수정 요청 형식이 올바르지 않습니다.",
        issues: payload.error.issues,
      });
    }

    const question = questionService.updateQuestion(Number(request.params.id), payload.data);
    if (!question) {
      return reply.code(404).send({
        message: "수정할 질문을 찾을 수 없습니다.",
      });
    }

    return {
      message: "질문을 수정했습니다.",
      data: question,
    };
  });
}
