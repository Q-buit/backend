import type { Track } from "./question.js";

export type SubscriptionStatus = "pending" | "active" | "dormant" | "unsubscribed";
export type TokenType = "verify" | "manage" | "unsubscribe";

export type Subscriber = {
  id: number;
  email: string;
  status: SubscriptionStatus;
  consentToReceive: boolean;
  createdAt: string;
  updatedAt: string;
};

export type SubscriberTrack = {
  id: number;
  subscriberId: number;
  track: Track;
  status: SubscriptionStatus;
  currentQuestionOrder: number;
  lastClickedAt: string | null;
  activatedAt: string | null;
  dormantAt: string | null;
  unsubscribedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type SubscriptionToken = {
  id: number;
  subscriberId: number;
  type: TokenType;
  token: string;
  expiresAt: string;
  usedAt: string | null;
  createdAt: string;
};
