import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { QuestionRepository } from "../repositories/question-repository.js";
import { QuestionService } from "../services/question-service.js";

export async function registerQuestionRoutes(app: FastifyInstance) {
  const questionService = new QuestionService(new QuestionRepository());
  const trackSchema = z.enum(["frontend", "backend"]);

  app.get("/questions", async (request, reply) => {
    const querySchema = z.object({
      track: trackSchema.optional(),
    });
    const parsedQuery = querySchema.safeParse(request.query);

    if (!parsedQuery.success) {
      return reply.code(400).send({
        message: "질문 조회 쿼리 형식이 올바르지 않습니다.",
        issues: parsedQuery.error.issues,
      });
    }

    return questionService.listQuestions(parsedQuery.data.track);
  });

  app.get<{ Params: { id: string } }>("/questions/:id", async (request, reply) => {
    const question = await questionService.getQuestionById(Number(request.params.id));

    if (!question) {
      return reply.code(404).send({
        message: "질문을 찾을 수 없습니다.",
      });
    }

    return question;
  });

  app.get<{ Params: { track: "frontend" | "backend"; order: string } }>("/questions/:track/:order", async (request, reply) => {
    const parsedTrack = trackSchema.safeParse(request.params.track);
    const questionOrder = Number(request.params.order);

    if (!parsedTrack.success || !Number.isInteger(questionOrder) || questionOrder < 1) {
      return reply.code(400).send({
        message: "질문 조회 경로 형식이 올바르지 않습니다.",
      });
    }

    const question = await questionService.getQuestionDetail(parsedTrack.data, questionOrder);
    if (!question) {
      return reply.code(404).send({
        message: "질문을 찾을 수 없습니다.",
      });
    }

    return question;
  });
}
