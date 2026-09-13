import { UserId } from "src/domain/identity/User";
import { Message, MessageStatus } from "./Message";

export type ConversationId = string;

export type ConversationParticipant = {
  userID: UserId;
  email: string;
  blockStatus: boolean;
  deleteStatus: boolean;
};

export type ConversationContact = {
  uid: UserId;
  email: string;
  profilePic: string;
};

export type Conversation = {
  id: ConversationId;
  chatId?: ConversationId;
  participants: ConversationParticipant[];
  participantIDs: UserId[];
  lastMessageStatus?: { status: MessageStatus; userID: UserId };
  messages: Message[];
  lastModified: number | string;
  showChatInfo?: boolean;
  contact?: ConversationContact;
  lastSeen?: string;
};
