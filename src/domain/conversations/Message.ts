import { UserId } from "src/domain/identity/User";

export type MessageId = string;
export type MessageStatus = "SENT" | "DELIVERED" | "SEEN" | "";
export type MessageContentType = "text" | "image" | "";

export type Message = {
  messageID: MessageId;
  content: string;
  contentType: MessageContentType;
  ownerID: UserId;
  timestamp: number | string;
  messageStatus: MessageStatus;
  replyTo?: MessageId | null;
  deletedAt?: number | string | null;
  clientState?: "pending" | "failed";
};

export type MessageDraft = {
  content: string;
  replyTo?: MessageId;
};
