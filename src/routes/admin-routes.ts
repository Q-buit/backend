import type { FastifyInstance } from "fastify";
import { z } from "zod";

const adminQuestionSchema = z.object({
  track: z.enum(["frontend", "backend"]),
  category: z.string().min(1),
  questionType: z.enum(["concept", "experience"]),
  recommendedFramework: z.enum(["PREP", "STAR"]),
  title: z.string().min(1),
  question: z.string().min(1),
  conceptSummary: z.string().min(1),
  modelAnswer: z.string().min(1),
  followUps: z.array(z.string()).default([]),
});

export async function registerAdminRoutes(app: FastifyInstance) {
  app.post("/admin/questions", async (request, reply) => {
    const payload = adminQuestionSchema.safeParse(request.body);

    if (!payload.success) {
      return reply.code(400).send({
        message: "질문 생성 요청 형식이 올바르지 않습니다.",
        issues: payload.error.issues,
      });
    }

    return reply.code(201).send({
      message: "MVP 구현 예정: 질문 저장",
      data: payload.data,
    });
  });
}
