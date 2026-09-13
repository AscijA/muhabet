import { Conversation, ConversationParticipant } from "src/domain/conversations/Conversation";
import { ConversationRepository } from "src/domain/conversations/ConversationRepository";
import { Message, MessageStatus } from "src/domain/conversations/Message";
import { addE2EMessage, createE2EChat, getE2EChats, subscribeE2EChats, updateE2EMessage, updateE2EParticipants } from "src/e2e/mockBackend";

export class InMemoryConversationRepository implements ConversationRepository {
  watchForUser = (_userId: string, observer: (items: Conversation[]) => void) => subscribeE2EChats(observer);
  getMessagePage = async (conversationId: string, before = Number.POSITIVE_INFINITY, pageSize = 50) => {
    const conversations = getE2EChats();
    return (conversations.find(item => item.id === conversationId)?.messages || [])
      .filter(message => Number(new Date(message.timestamp)) < before).slice(-pageSize);
  };
  create = async (participants: ConversationParticipant[]) =>
    createE2EChat(participants.find(item => item.userID !== "user-me")?.email || "new@example.com");
  updateParticipants = async (conversationId: string, participants: ConversationParticipant[]) => {
    updateE2EParticipants(conversationId, participants);
  };
  anonymizeUser = async (_userId: string) => undefined;
  sendMessage = async (conversationId: string, message: Message) => { addE2EMessage(conversationId, message); };
  updateMessage = async (conversationId: string, messageId: string, changes: Partial<Message>) => {
    updateE2EMessage(conversationId, messageId, changes);
  };
  updateMessageStatus = async (conversationId: string, messageId: string, status: MessageStatus) => {
    updateE2EMessage(conversationId, messageId, { messageStatus: status });
  };
}
