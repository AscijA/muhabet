import { UserId } from "src/domain/identity/User";
import { Conversation, ConversationId, ConversationParticipant } from "./Conversation";
import { Message, MessageId, MessageStatus } from "./Message";

export interface ConversationRepository {
  watchForUser(userId: UserId, observer: (conversations: Conversation[]) => void, pageSize?: number): () => void;
  getMessagePage(conversationId: ConversationId, before?: number, pageSize?: number): Promise<Message[]>;
  create(participants: ConversationParticipant[]): Promise<ConversationId>;
  updateParticipants(conversationId: ConversationId, participants: ConversationParticipant[]): Promise<void>;
  anonymizeUser(userId: UserId): Promise<void>;
  sendMessage(conversationId: ConversationId, message: Message): Promise<void>;
  updateMessage(conversationId: ConversationId, messageId: MessageId, changes: Partial<Message>): Promise<void>;
  updateMessageStatus(conversationId: ConversationId, messageId: MessageId, status: MessageStatus): Promise<void>;
}
