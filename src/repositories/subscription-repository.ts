import type {
  SubscriptionStatus as PrismaSubscriptionStatus,
  TokenType as PrismaTokenType,
  Track as PrismaTrack,
} from "@prisma/client";
import type {
  Subscriber,
  SubscriberTrack,
  SubscriptionStatus,
  SubscriptionToken,
  TokenType,
} from "../domain/subscription.js";
import type { Track } from "../domain/question.js";
import { prisma } from "../lib/prisma.js";

export class SubscriptionRepository {
  async findSubscriberByEmail(email: string): Promise<Subscriber | null> {
    const subscriber = await prisma.subscriber.findUnique({
      where: { email },
    });

    return subscriber ? this.toSubscriber(subscriber) : null;
  }

  async findSubscriberById(id: number): Promise<Subscriber | null> {
    const subscriber = await prisma.subscriber.findUnique({
      where: { id },
    });

    return subscriber ? this.toSubscriber(subscriber) : null;
  }

  async createSubscriber(input: Pick<Subscriber, "email" | "status" | "consentToReceive">): Promise<Subscriber> {
    const subscriber = await prisma.subscriber.create({
      data: {
        email: input.email,
        status: input.status as PrismaSubscriptionStatus,
        consentToReceive: input.consentToReceive,
      },
    });

    return this.toSubscriber(subscriber);
  }

  async updateSubscriber(
    id: number,
    update: Partial<Pick<Subscriber, "status" | "consentToReceive">>,
  ): Promise<Subscriber | null> {
    const existing = await prisma.subscriber.findUnique({
      where: { id },
      select: { id: true },
    });
    if (!existing) {
      return null;
    }

    const subscriber = await prisma.subscriber.update({
      where: { id },
      data: {
        ...(update.status ? { status: update.status as PrismaSubscriptionStatus } : {}),
        ...(update.consentToReceive !== undefined
          ? { consentToReceive: update.consentToReceive }
          : {}),
      },
    });

    return this.toSubscriber(subscriber);
  }

  async findTracksBySubscriberId(subscriberId: number): Promise<SubscriberTrack[]> {
    const tracks = await prisma.subscriberTrack.findMany({
      where: { subscriberId },
      orderBy: { createdAt: "asc" },
    });

    return tracks.map((track) => this.toSubscriberTrack(track));
  }

  async upsertTrack(
    subscriberId: number,
    track: Track,
    status: SubscriptionStatus,
  ): Promise<SubscriberTrack> {
    const now = new Date();
    const existingTrack = await prisma.subscriberTrack.findUnique({
      where: {
        subscriberId_track: {
          subscriberId,
          track: track as PrismaTrack,
        },
      },
    });

    if (existingTrack) {
      const subscriberTrack = await prisma.subscriberTrack.update({
        where: {
          subscriberId_track: {
            subscriberId,
            track: track as PrismaTrack,
          },
        },
        data: {
          status: status as PrismaSubscriptionStatus,
          ...(status === "active" && !existingTrack.activatedAt ? { activatedAt: now } : {}),
          ...(status === "dormant" ? { dormantAt: now } : {}),
          ...(status === "unsubscribed" ? { unsubscribedAt: now } : {}),
        },
      });

      return this.toSubscriberTrack(subscriberTrack);
    }

    const subscriberTrack = await prisma.subscriberTrack.upsert({
      where: {
        subscriberId_track: {
          subscriberId,
          track: track as PrismaTrack,
        },
      },
      update: {},
      create: {
        subscriberId,
        track: track as PrismaTrack,
        status: status as PrismaSubscriptionStatus,
        currentQuestionOrder: 1,
        activatedAt: status === "active" ? now : null,
        dormantAt: status === "dormant" ? now : null,
        unsubscribedAt: status === "unsubscribed" ? now : null,
      },
    });

    return this.toSubscriberTrack(subscriberTrack);
  }

  async updateAllTracksStatus(subscriberId: number, status: SubscriptionStatus): Promise<void> {
    const now = new Date();
    const tracks = await prisma.subscriberTrack.findMany({
      where: { subscriberId },
    });

    await prisma.$transaction(
      tracks.map((track) =>
        prisma.subscriberTrack.update({
          where: { id: track.id },
          data: {
            status: status as PrismaSubscriptionStatus,
            ...(status === "active" && !track.activatedAt ? { activatedAt: now } : {}),
            ...(status === "dormant" ? { dormantAt: now } : {}),
            ...(status === "unsubscribed" ? { unsubscribedAt: now } : {}),
          },
        }),
      ),
    );
  }

  async createToken(
    subscriberId: number,
    type: TokenType,
    tokenHash: string,
    expiresAt: string,
  ): Promise<SubscriptionToken> {
    const token = await prisma.subscriptionToken.create({
      data: {
        subscriberId,
        type: type as PrismaTokenType,
        tokenHash,
        expiresAt: new Date(expiresAt),
      },
    });

    return this.toSubscriptionToken(token);
  }

  async findValidToken(tokenHash: string, type: TokenType): Promise<SubscriptionToken | null> {
    const token = await prisma.subscriptionToken.findFirst({
      where: {
        tokenHash,
        type: type as PrismaTokenType,
        usedAt: null,
        expiresAt: {
          gt: new Date(),
        },
      },
    });

    return token ? this.toSubscriptionToken(token) : null;
  }

  async markTokenUsed(id: number): Promise<SubscriptionToken | null> {
    const existing = await prisma.subscriptionToken.findUnique({
      where: { id },
      select: { id: true },
    });
    if (!existing) {
      return null;
    }

    const token = await prisma.subscriptionToken.update({
      where: { id },
      data: {
        usedAt: new Date(),
      },
    });

    return this.toSubscriptionToken(token);
  }

  private toSubscriber(subscriber: {
    id: number;
    email: string;
    status: PrismaSubscriptionStatus;
    consentToReceive: boolean;
    createdAt: Date;
    updatedAt: Date;
  }): Subscriber {
    return {
      id: subscriber.id,
      email: subscriber.email,
      status: subscriber.status as SubscriptionStatus,
      consentToReceive: subscriber.consentToReceive,
      createdAt: subscriber.createdAt.toISOString(),
      updatedAt: subscriber.updatedAt.toISOString(),
    };
  }

  private toSubscriberTrack(track: {
    id: number;
    subscriberId: number;
    track: PrismaTrack;
    status: PrismaSubscriptionStatus;
    currentQuestionOrder: number;
    lastClickedAt: Date | null;
    activatedAt: Date | null;
    dormantAt: Date | null;
    unsubscribedAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
  }): SubscriberTrack {
    return {
      id: track.id,
      subscriberId: track.subscriberId,
      track: track.track as Track,
      status: track.status as SubscriptionStatus,
      currentQuestionOrder: track.currentQuestionOrder,
      lastClickedAt: track.lastClickedAt?.toISOString() ?? null,
      activatedAt: track.activatedAt?.toISOString() ?? null,
      dormantAt: track.dormantAt?.toISOString() ?? null,
      unsubscribedAt: track.unsubscribedAt?.toISOString() ?? null,
      createdAt: track.createdAt.toISOString(),
      updatedAt: track.updatedAt.toISOString(),
    };
  }

  private toSubscriptionToken(token: {
    id: number;
    subscriberId: number;
    type: PrismaTokenType;
    tokenHash: string;
    expiresAt: Date;
    usedAt: Date | null;
    createdAt: Date;
  }): SubscriptionToken {
    return {
      id: token.id,
      subscriberId: token.subscriberId,
      type: token.type as TokenType,
      token: token.tokenHash,
      expiresAt: token.expiresAt.toISOString(),
      usedAt: token.usedAt?.toISOString() ?? null,
      createdAt: token.createdAt.toISOString(),
    };
  }
}
