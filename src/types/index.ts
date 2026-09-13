// Compatibility exports. Feature code should import domain names directly.
export type { User, UserId, AuthenticatedUser } from "src/domain/identity/User";
export type { Message, MessageId, MessageStatus, MessageContentType as ContentType, MessageDraft } from "src/domain/conversations/Message";
export type {
  Conversation,
  ConversationId,
  ConversationParticipant,
  ConversationContact,
} from "src/domain/conversations/Conversation";

export type { Conversation as Chat } from "src/domain/conversations/Conversation";
export type { ConversationParticipant as Participant } from "src/domain/conversations/Conversation";
export type { ConversationContact as ChatContact } from "src/domain/conversations/Conversation";
export type LastMessageStatus = {
  status: string;
  userID: string;
};
