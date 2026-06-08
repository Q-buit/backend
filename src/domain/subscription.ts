import type { Track } from "./question.js";

export type SubscriptionStatus = "pending" | "active" | "dormant" | "unsubscribed" | "bounced";

export type Subscriber = {
  id: number;
  email: string;
  consentToMarketing: boolean;
  status: SubscriptionStatus;
  createdAt: string;
};

export type SubscriberTrack = {
  subscriberId: number;
  track: Track;
  categories: string[];
  status: Exclude<SubscriptionStatus, "bounced">;
  currentSequence: number;
  lastClickedAt: string | null;
};
