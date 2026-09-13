import { chatServices } from "src/app/chatServices";
import { Chat, Message, Participant } from "src/types";
import { updateChatByID, ChatState } from "src/store/chatSlice";
import { UserState } from "src/store/userSlice";
import { AppDispatch } from "src/store/store";

export const updateChatParticipants = (conversationId: string, participants: Participant[]) =>
  chatServices.conversations.updateParticipants(conversationId, participants);

export const createChat = async (chatData: Partial<Chat>): Promise<string | undefined> => {
  if (!chatData.participants) return undefined;
  return chatServices.conversations.create(chatData.participants);
};

export const handleChatStatus = (
  type = "block", chat: ChatState, currentUser: UserState, dispatch: AppDispatch,
  closeContactInfo: (() => void) | null = null,
) => {
  const conversation = chat.entities[chat.selectedConversationId];
  if (!conversation?.participants) return;
  const participants = conversation.participants.map(participant => {
    if (participant.userID !== currentUser.uid) return participant;
    if (type === "delete") return { ...participant, deleteStatus: !participant.deleteStatus };
    return { ...participant, blockStatus: !participant.blockStatus };
  });
  chatServices.conversations.updateParticipants(conversation.id, participants).then(() => {
    dispatch(updateChatByID({ ...conversation, participants }));
    closeContactInfo?.();
  }).catch(error => console.error("Error updating conversation:", error));
};

export const addMessageToSubcollection = (conversationId: string, message: Message) =>
  chatServices.conversations.sendMessage(conversationId, message);

export const updateMessageInSubcollection = (conversationId: string, messageId: string, changes: Partial<Message>) =>
  chatServices.conversations.updateMessage(conversationId, messageId, changes);
