import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { SubscriptionRepository } from "../repositories/subscription-repository.js";
import { ConsoleMailSender } from "../services/mail/console-mail-sender.js";
import { SubscriptionMailService } from "../services/mail/subscription-mail-service.js";
import { SubscriptionService } from "../services/subscription-service.js";

const createSubscriptionSchema = z.object({
  email: z.string().email(),
  tracks: z.array(z.enum(["frontend", "backend"])).min(1),
  consentToReceive: z.boolean(),
});

export async function registerSubscriptionRoutes(app: FastifyInstance) {
  const subscriptionService = new SubscriptionService(
    new SubscriptionRepository(),
    new SubscriptionMailService(new ConsoleMailSender()),
  );

  app.post("/subscriptions", async (request, reply) => {
    const payload = createSubscriptionSchema.safeParse(request.body);

    if (!payload.success) {
      return reply.code(400).send({
        message: "구독 요청 형식이 올바르지 않습니다.",
        issues: payload.error.issues,
      });
    }

    const result = await subscriptionService.createSubscription(payload.data);

    return reply.code(201).send({
      message: "구독 요청을 저장했습니다. 인증 링크를 확인해 주세요.",
      data: result,
    });
  });

  app.get<{ Querystring: { token: string } }>("/subscriptions/verify", async (request, reply) => {
    const tokenSchema = z.object({
      token: z.string().min(1),
    });
    const payload = tokenSchema.safeParse(request.query);

    if (!payload.success) {
      return reply.code(400).send({
        message: "인증 토큰 형식이 올바르지 않습니다.",
      });
    }

    const result = await subscriptionService.verifySubscription(payload.data.token);
    if (!result) {
      return reply.code(404).send({
        message: "유효한 인증 토큰을 찾을 수 없습니다.",
      });
    }

    return {
      message: "이메일 인증이 완료되었습니다.",
      data: result,
    };
  });

  app.post<{ Body: { token: string } }>("/subscriptions/unsubscribe", async (request, reply) => {
    const tokenSchema = z.object({
      token: z.string().min(1),
    });
    const payload = tokenSchema.safeParse(request.body);

    if (!payload.success) {
      return reply.code(400).send({
        message: "구독 취소 토큰 형식이 올바르지 않습니다.",
      });
    }

    const result = await subscriptionService.unsubscribe(payload.data.token);
    if (!result) {
      return reply.code(404).send({
        message: "유효한 구독 취소 토큰을 찾을 수 없습니다.",
      });
    }

    return {
      message: "구독이 취소되었습니다.",
      data: result,
    };
  });

  app.get<{ Querystring: { token: string } }>("/subscriptions/manage", async (request, reply) => {
    const tokenSchema = z.object({
      token: z.string().min(1),
    });
    const payload = tokenSchema.safeParse(request.query);

    if (!payload.success) {
      return reply.code(400).send({
        message: "관리 토큰 형식이 올바르지 않습니다.",
      });
    }

    const result = await subscriptionService.getManageData(payload.data.token);
    if (!result) {
      return reply.code(404).send({
        message: "유효한 관리 토큰을 찾을 수 없습니다.",
      });
    }

    return {
      message: "구독 관리 정보를 조회했습니다.",
      data: result,
    };
  });
}
