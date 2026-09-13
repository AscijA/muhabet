import { MessageStatus } from "./Message";

const rank: Record<MessageStatus, number> = { "": 0, SENT: 1, DELIVERED: 2, SEEN: 3 };

export const canAdvanceMessageStatus = (current: MessageStatus, next: MessageStatus) => rank[next] > rank[current];

export const advanceMessageStatus = (current: MessageStatus, next: MessageStatus): MessageStatus =>
  canAdvanceMessageStatus(current, next) ? next : current;
