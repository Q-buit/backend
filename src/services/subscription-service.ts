import { randomBytes } from "node:crypto";
import type { Track } from "../domain/question.js";
import { SubscriptionRepository } from "../repositories/subscription-repository.js";

type CreateSubscriptionInput = {
  email: string;
  tracks: Track[];
  consentToReceive: boolean;
};

const VERIFY_TOKEN_TTL_HOURS = 24;
const MANAGE_TOKEN_TTL_DAYS = 30;
const UNSUBSCRIBE_TOKEN_TTL_DAYS = 30;

export class SubscriptionService {
  constructor(private readonly subscriptionRepository: SubscriptionRepository) {}

  createSubscription(input: CreateSubscriptionInput) {
    const existingSubscriber = this.subscriptionRepository.findSubscriberByEmail(input.email);
    const subscriber =
      existingSubscriber ??
      this.subscriptionRepository.createSubscriber({
        email: input.email,
        status: "pending",
        consentToReceive: input.consentToReceive,
      });

    if (existingSubscriber) {
      this.subscriptionRepository.updateSubscriber(existingSubscriber.id, {
        status: "pending",
        consentToReceive: input.consentToReceive,
      });
    }

    for (const track of input.tracks) {
      this.subscriptionRepository.upsertTrack(subscriber.id, track, "pending");
    }

    const verifyToken = this.subscriptionRepository.createToken(
      subscriber.id,
      "verify",
      this.generateToken(),
      this.createExpiresAtHours(VERIFY_TOKEN_TTL_HOURS),
    );

    return {
      subscriber,
      verifyToken: verifyToken.token,
      verifyUrl: `/subscriptions/verify?token=${verifyToken.token}`,
    };
  }

  verifySubscription(token: string) {
    const verifyToken = this.subscriptionRepository.findValidToken(token, "verify");
    if (!verifyToken) {
      return null;
    }

    this.subscriptionRepository.markTokenUsed(verifyToken.id);
    const subscriber = this.subscriptionRepository.updateSubscriber(verifyToken.subscriberId, { status: "active" });
    if (!subscriber) {
      return null;
    }

    this.subscriptionRepository.updateAllTracksStatus(subscriber.id, "active");

    const manageToken = this.subscriptionRepository.createToken(
      subscriber.id,
      "manage",
      this.generateToken(),
      this.createExpiresAtDays(MANAGE_TOKEN_TTL_DAYS),
    );
    const unsubscribeToken = this.subscriptionRepository.createToken(
      subscriber.id,
      "unsubscribe",
      this.generateToken(),
      this.createExpiresAtDays(UNSUBSCRIBE_TOKEN_TTL_DAYS),
    );

    return {
      subscriber,
      tracks: this.subscriptionRepository.findTracksBySubscriberId(subscriber.id),
      manageToken: manageToken.token,
      unsubscribeToken: unsubscribeToken.token,
    };
  }

  getManageData(token: string) {
    const manageToken = this.subscriptionRepository.findValidToken(token, "manage");
    if (!manageToken) {
      return null;
    }

    const subscriber = this.subscriptionRepository.findSubscriberById(manageToken.subscriberId);
    if (!subscriber) {
      return null;
    }

    return {
      subscriber,
      tracks: this.subscriptionRepository.findTracksBySubscriberId(subscriber.id),
    };
  }

  unsubscribe(token: string) {
    const unsubscribeToken = this.subscriptionRepository.findValidToken(token, "unsubscribe");
    if (!unsubscribeToken) {
      return null;
    }

    this.subscriptionRepository.markTokenUsed(unsubscribeToken.id);
    const subscriber = this.subscriptionRepository.updateSubscriber(unsubscribeToken.subscriberId, { status: "unsubscribed" });
    if (!subscriber) {
      return null;
    }

    this.subscriptionRepository.updateAllTracksStatus(subscriber.id, "unsubscribed");

    return {
      subscriber,
      tracks: this.subscriptionRepository.findTracksBySubscriberId(subscriber.id),
    };
  }

  private generateToken() {
    return randomBytes(24).toString("hex");
  }

  private createExpiresAtHours(hours: number) {
    return new Date(Date.now() + hours * 60 * 60 * 1000).toISOString();
  }

  private createExpiresAtDays(days: number) {
    return new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString();
  }
}
