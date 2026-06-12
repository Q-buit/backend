import { createHash, randomBytes } from "node:crypto";
import type { Track } from "../domain/question.js";
import { SubscriptionRepository } from "../repositories/subscription-repository.js";
import type { SubscriptionMailService } from "./mail/subscription-mail-service.js";

type CreateSubscriptionInput = {
  email: string;
  tracks: Track[];
  consentToReceive: boolean;
};

const VERIFY_TOKEN_TTL_HOURS = 24;
const MANAGE_TOKEN_TTL_DAYS = 30;
const UNSUBSCRIBE_TOKEN_TTL_DAYS = 30;

export class SubscriptionService {
  constructor(
    private readonly subscriptionRepository: SubscriptionRepository,
    private readonly subscriptionMailService?: SubscriptionMailService,
  ) {}

  async createSubscription(input: CreateSubscriptionInput) {
    const existingSubscriber = await this.subscriptionRepository.findSubscriberByEmail(input.email);
    const subscriber =
      existingSubscriber ??
      (await this.subscriptionRepository.createSubscriber({
        email: input.email,
        status: "pending",
        consentToReceive: input.consentToReceive,
      }));

    if (existingSubscriber) {
      await this.subscriptionRepository.updateSubscriber(existingSubscriber.id, {
        status: "pending",
        consentToReceive: input.consentToReceive,
      });
    }

    for (const track of input.tracks) {
      await this.subscriptionRepository.upsertTrack(subscriber.id, track, "pending");
    }

    const rawVerifyToken = this.generateToken();
    await this.subscriptionRepository.createToken(
      subscriber.id,
      "verify",
      this.hashToken(rawVerifyToken),
      this.createExpiresAtHours(VERIFY_TOKEN_TTL_HOURS),
    );

    const verifyUrl = this.createVerifyUrl(rawVerifyToken);

    if (this.subscriptionMailService) {
      await this.subscriptionMailService.sendVerifyMail({
        email: subscriber.email,
        tracks: input.tracks,
        verifyUrl,
      });
    }

    return {
      subscriber,
      verifyToken: rawVerifyToken,
      verifyUrl,
    };
  }

  async verifySubscription(token: string) {
    const verifyToken = await this.subscriptionRepository.findValidToken(this.hashToken(token), "verify");
    if (!verifyToken) {
      return null;
    }

    await this.subscriptionRepository.markTokenUsed(verifyToken.id);
    const subscriber = await this.subscriptionRepository.updateSubscriber(verifyToken.subscriberId, {
      status: "active",
    });
    if (!subscriber) {
      return null;
    }

    await this.subscriptionRepository.updateAllTracksStatus(subscriber.id, "active");

    const rawManageToken = this.generateToken();
    await this.subscriptionRepository.createToken(
      subscriber.id,
      "manage",
      this.hashToken(rawManageToken),
      this.createExpiresAtDays(MANAGE_TOKEN_TTL_DAYS),
    );
    const rawUnsubscribeToken = this.generateToken();
    await this.subscriptionRepository.createToken(
      subscriber.id,
      "unsubscribe",
      this.hashToken(rawUnsubscribeToken),
      this.createExpiresAtDays(UNSUBSCRIBE_TOKEN_TTL_DAYS),
    );

    const tracks = await this.subscriptionRepository.findTracksBySubscriberId(subscriber.id);
    if (this.subscriptionMailService) {
      await this.subscriptionMailService.sendActivationMail({
        email: subscriber.email,
        tracks: tracks.map((track) => track.track),
        manageUrl: this.createManageUrl(rawManageToken),
      });
    }

    return {
      subscriber,
      tracks,
      manageToken: rawManageToken,
      unsubscribeToken: rawUnsubscribeToken,
      manageUrl: this.createManageUrl(rawManageToken),
    };
  }

  async getManageData(token: string) {
    const manageToken = await this.subscriptionRepository.findValidToken(this.hashToken(token), "manage");
    if (!manageToken) {
      return null;
    }

    const subscriber = await this.subscriptionRepository.findSubscriberById(manageToken.subscriberId);
    if (!subscriber) {
      return null;
    }

    return {
      subscriber,
      tracks: await this.subscriptionRepository.findTracksBySubscriberId(subscriber.id),
    };
  }

  async unsubscribe(token: string) {
    const unsubscribeToken = await this.subscriptionRepository.findValidToken(
      this.hashToken(token),
      "unsubscribe",
    );
    if (!unsubscribeToken) {
      return null;
    }

    await this.subscriptionRepository.markTokenUsed(unsubscribeToken.id);
    const subscriber = await this.subscriptionRepository.updateSubscriber(unsubscribeToken.subscriberId, {
      status: "unsubscribed",
    });
    if (!subscriber) {
      return null;
    }

    await this.subscriptionRepository.updateAllTracksStatus(subscriber.id, "unsubscribed");

    return {
      subscriber,
      tracks: await this.subscriptionRepository.findTracksBySubscriberId(subscriber.id),
    };
  }

  private generateToken() {
    return randomBytes(24).toString("hex");
  }

  private hashToken(token: string) {
    return createHash("sha256").update(token).digest("hex");
  }

  private createExpiresAtHours(hours: number) {
    return new Date(Date.now() + hours * 60 * 60 * 1000).toISOString();
  }

  private createExpiresAtDays(days: number) {
    return new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString();
  }

  private createVerifyUrl(token: string) {
    const baseUrl = process.env.PUBLIC_API_BASE_URL ?? `http://localhost:${process.env.PORT ?? 4000}`;
    return `${baseUrl}/subscriptions/verify?token=${token}`;
  }

  private createManageUrl(token: string) {
    const baseUrl = process.env.PUBLIC_WEB_BASE_URL ?? "http://localhost:3000";
    return `${baseUrl}/manage?token=${token}`;
  }
}
