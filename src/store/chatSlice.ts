import { createEntityAdapter, createSelector, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Chat, ChatContact, Message } from "src/types";
import type { RootState } from "./store";

type CurrentChat = {
  chatId: string;
  lastSeen?: string;
  contact: ChatContact;
  messages: Message[];
};

const emptyCurrentChat = (): CurrentChat => ({
  chatId: "", lastSeen: "", contact: { profilePic: "", email: "", uid: "" }, messages: [],
});
const emptyMessages: Message[] = [];

const activity = (chat: Chat) => {
  const lastMessage = chat.messages[chat.messages.length - 1];
  return Number(lastMessage?.timestamp || chat.lastModified || 0);
};

const conversationAdapter = createEntityAdapter<Chat>({
  sortComparer: (a, b) => activity(b) - activity(a) || a.id.localeCompare(b.id),
});

const initialState = conversationAdapter.getInitialState({
  uid: "",
  showChatInfo: false,
  showDefaultImage: true,
  showContactDefaultImage: false,
  showNewChatModal: false,
  selectedConversationId: "",
  selectedContact: emptyCurrentChat().contact,
  connectionState: "connecting" as "connecting" | "online" | "offline",
});

export type ChatState = typeof initialState;

const chatSlice = createSlice({
  name: "chat",
  initialState,
  reducers: {
    toggleShowChatInfo: state => { state.showChatInfo = !state.showChatInfo; },
    setShowDefaultImage: (state, action: PayloadAction<boolean>) => { state.showDefaultImage = action.payload; },
    setShowContactDefaultImage: (state, action: PayloadAction<boolean>) => { state.showContactDefaultImage = action.payload; },
    setShowNewChatModal: (state, action: PayloadAction<boolean>) => { state.showNewChatModal = action.payload; },
    setConnectionState: (state, action: PayloadAction<"connecting" | "online" | "offline">) => { state.connectionState = action.payload; },
    setCurrentChat: (state, action: PayloadAction<CurrentChat>) => {
      state.selectedConversationId = action.payload.chatId;
      state.selectedContact = action.payload.contact;
    },
    updateContact: (state, action: PayloadAction<Partial<ChatContact>>) => {
      state.selectedContact = { ...state.selectedContact, ...action.payload };
    },
    setAllChats: (state, action: PayloadAction<Chat[]>) => {
      conversationAdapter.setAll(state, action.payload);
    },
    updateChatByID: (state, action: PayloadAction<Chat>) => {
      conversationAdapter.upsertOne(state, action.payload);
    },
    addOptimisticMessage: (state, action: PayloadAction<{ conversationId: string; message: Message }>) => {
      const conversation = state.entities[action.payload.conversationId];
      if (conversation) conversation.messages.push(action.payload.message);
    },
    markMessageFailed: (state, action: PayloadAction<{ conversationId: string; messageId: string }>) => {
      const message = state.entities[action.payload.conversationId]?.messages.find(item => item.messageID === action.payload.messageId);
      if (message) message.clientState = "failed";
    },
    markMessagePending: (state, action: PayloadAction<{ conversationId: string; messageId: string }>) => {
      const message = state.entities[action.payload.conversationId]?.messages.find(item => item.messageID === action.payload.messageId);
      if (message) message.clientState = "pending";
    },
    resetChatState: () => initialState,
  },
});

const selectors = conversationAdapter.getSelectors<RootState>(state => state.chat);
export const selectAllChats = selectors.selectAll;
export const selectChatById = selectors.selectById;
export const selectCurrentChat = createSelector(
  [
    (state: RootState) => state.chat.selectedConversationId,
    (state: RootState) => state.chat.selectedContact,
    (state: RootState) => state.chat.entities[state.chat.selectedConversationId],
  ],
  (chatId, contact, conversation): CurrentChat => ({
    chatId,
    lastSeen: "",
    contact,
    messages: conversation?.messages || emptyMessages,
  }),
);

export const {
  toggleShowChatInfo, updateContact, setCurrentChat, setAllChats, updateChatByID,
  resetChatState, setShowContactDefaultImage, setShowNewChatModal, setShowDefaultImage,
  addOptimisticMessage, markMessageFailed, markMessagePending,
  setConnectionState,
} = chatSlice.actions;

export default chatSlice.reducer;
