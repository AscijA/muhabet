import { ConversationRepository } from "src/domain/conversations/ConversationRepository";
import { Message, MessageId, MessageStatus } from "src/domain/conversations/Message";
import { ConversationId } from "src/domain/conversations/Conversation";
import { UserId } from "src/domain/identity/User";
import { canAdvanceMessageStatus } from "src/domain/conversations/messageStatus";

export const createMessageUseCases = (repository: ConversationRepository) => ({
  create: (ownerId: UserId, content: string, replyTo?: MessageId): Message => ({
    messageID: `${Date.now()}_${ownerId}`,
    content: content.trim(), contentType: "text", ownerID: ownerId,
    messageStatus: "SENT", timestamp: new Date().toISOString(),
    ...(replyTo ? { replyTo } : {}),
    clientState: "pending",
  }),
  send: (conversationId: ConversationId, message: Message) => {
    if (!message.content) return Promise.resolve();
    const persisted = { ...message };
    delete persisted.clientState;
    return repository.sendMessage(conversationId, persisted);
  },
  edit: (conversationId: ConversationId, messageId: MessageId, content: string) =>
    repository.updateMessage(conversationId, messageId, { content: content.trim() }),
  remove: (conversationId: ConversationId, messageId: MessageId) =>
    repository.updateMessage(conversationId, messageId, { content: "", deletedAt: new Date().toISOString() }),
  advanceStatus: (conversationId: ConversationId, message: Message, next: MessageStatus) => {
    if (!canAdvanceMessageStatus(message.messageStatus, next)) return Promise.resolve();
    return repository.updateMessageStatus(conversationId, message.messageID, next);
  },
});
