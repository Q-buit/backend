import type { Subscriber, SubscriberTrack, SubscriptionToken, SubscriptionStatus, TokenType } from "../domain/subscription.js";
import type { Track } from "../domain/question.js";

const subscribers: Subscriber[] = [];
const subscriberTracks: SubscriberTrack[] = [];
const subscriptionTokens: SubscriptionToken[] = [];

export class SubscriptionRepository {
  findSubscriberByEmail(email: string) {
    return subscribers.find((subscriber) => subscriber.email === email) ?? null;
  }

  findSubscriberById(id: number) {
    return subscribers.find((subscriber) => subscriber.id === id) ?? null;
  }

  createSubscriber(input: Pick<Subscriber, "email" | "status" | "consentToReceive">) {
    const timestamp = new Date().toISOString();
    const subscriber: Subscriber = {
      id: subscribers.reduce((max, item) => Math.max(max, item.id), 0) + 1,
      email: input.email,
      status: input.status,
      consentToReceive: input.consentToReceive,
      createdAt: timestamp,
      updatedAt: timestamp,
    };

    subscribers.push(subscriber);
    return subscriber;
  }

  updateSubscriber(id: number, update: Partial<Pick<Subscriber, "status" | "consentToReceive">>) {
    const subscriber = this.findSubscriberById(id);
    if (!subscriber) {
      return null;
    }

    Object.assign(subscriber, update, {
      updatedAt: new Date().toISOString(),
    });

    return subscriber;
  }

  findTracksBySubscriberId(subscriberId: number) {
    return subscriberTracks.filter((track) => track.subscriberId === subscriberId);
  }

  upsertTrack(subscriberId: number, track: Track, status: SubscriptionStatus) {
    const existingTrack = subscriberTracks.find((item) => item.subscriberId === subscriberId && item.track === track);
    const timestamp = new Date().toISOString();

    if (existingTrack) {
      existingTrack.status = status;
      existingTrack.updatedAt = timestamp;
      if (status === "active" && !existingTrack.activatedAt) {
        existingTrack.activatedAt = timestamp;
      }
      if (status === "unsubscribed") {
        existingTrack.unsubscribedAt = timestamp;
      }
      return existingTrack;
    }

    const subscriberTrack: SubscriberTrack = {
      id: subscriberTracks.reduce((max, item) => Math.max(max, item.id), 0) + 1,
      subscriberId,
      track,
      status,
      currentQuestionOrder: 1,
      lastClickedAt: null,
      activatedAt: status === "active" ? timestamp : null,
      dormantAt: null,
      unsubscribedAt: status === "unsubscribed" ? timestamp : null,
      createdAt: timestamp,
      updatedAt: timestamp,
    };

    subscriberTracks.push(subscriberTrack);
    return subscriberTrack;
  }

  updateAllTracksStatus(subscriberId: number, status: SubscriptionStatus) {
    const timestamp = new Date().toISOString();

    for (const track of subscriberTracks.filter((item) => item.subscriberId === subscriberId)) {
      track.status = status;
      track.updatedAt = timestamp;
      if (status === "active" && !track.activatedAt) {
        track.activatedAt = timestamp;
      }
      if (status === "unsubscribed") {
        track.unsubscribedAt = timestamp;
      }
    }
  }

  createToken(subscriberId: number, type: TokenType, token: string, expiresAt: string) {
    const subscriptionToken: SubscriptionToken = {
      id: subscriptionTokens.reduce((max, item) => Math.max(max, item.id), 0) + 1,
      subscriberId,
      type,
      token,
      expiresAt,
      usedAt: null,
      createdAt: new Date().toISOString(),
    };

    subscriptionTokens.push(subscriptionToken);
    return subscriptionToken;
  }

  findValidToken(token: string, type: TokenType) {
    const now = Date.now();
    return (
      subscriptionTokens.find((item) => {
        return item.token === token && item.type === type && item.usedAt === null && new Date(item.expiresAt).getTime() > now;
      }) ?? null
    );
  }

  markTokenUsed(id: number) {
    const token = subscriptionTokens.find((item) => item.id === id);
    if (!token) {
      return null;
    }

    token.usedAt = new Date().toISOString();
    return token;
  }
}
