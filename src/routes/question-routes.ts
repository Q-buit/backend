import type { FastifyInstance } from "fastify";
import { QuestionRepository } from "../repositories/question-repository.js";
import { QuestionService } from "../services/question-service.js";

export async function registerQuestionRoutes(app: FastifyInstance) {
  const questionService = new QuestionService(new QuestionRepository());

  app.get("/questions", async () => {
    return questionService.listQuestions();
  });

  app.get<{ Params: { id: string } }>("/questions/:id", async (request, reply) => {
    const question = questionService.getQuestionDetail(Number(request.params.id));

    if (!question) {
      return reply.code(404).send({
        message: "질문을 찾을 수 없습니다.",
      });
    }

    return question;
  });
}
