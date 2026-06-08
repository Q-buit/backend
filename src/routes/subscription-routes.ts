import type { FastifyInstance } from "fastify";
import { z } from "zod";

const createSubscriptionSchema = z.object({
  email: z.string().email(),
  tracks: z.array(z.enum(["frontend", "backend"])).min(1),
  categories: z.array(z.string()).min(1),
  consentToMarketing: z.boolean(),
});

export async function registerSubscriptionRoutes(app: FastifyInstance) {
  app.post("/subscriptions", async (request, reply) => {
    const payload = createSubscriptionSchema.safeParse(request.body);

    if (!payload.success) {
      return reply.code(400).send({
        message: "구독 요청 형식이 올바르지 않습니다.",
        issues: payload.error.issues,
      });
    }

    return reply.code(201).send({
      message: "구독 요청을 받았습니다. 실제 구현에서는 인증 메일을 발송해야 합니다.",
      data: payload.data,
    });
  });

  app.post("/subscriptions/unsubscribe", async () => {
    return {
      message: "MVP 구현 예정: 토큰 기반 전체 구독 취소",
    };
  });

  app.get("/subscriptions/manage/:token", async (request) => {
    return {
      message: "MVP 구현 예정: 토큰 기반 구독 관리 조회",
      token: (request.params as { token: string }).token,
    };
  });
}
