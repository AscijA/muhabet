import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Chat, ChatContact, Message, Participant } from '../types';

interface CurrentChatState extends Partial<Chat> {
  chatId: string;
  lastSeen?: string;
  contact: ChatContact;
  messages: Message[];
  participants?: Participant[];
}

export interface ChatState {
  uid: string;
  showChatInfo: boolean;
  showDefaultImage: boolean;
  showContactDefaultImage: boolean;
  showNewChatModal: boolean;
  currentChat: CurrentChatState;
  allChats: Chat[];
}

const initialState: ChatState = {
  uid: "",
  showChatInfo: false,
  showDefaultImage: true,
  showContactDefaultImage: false,
  showNewChatModal: false,
  currentChat: {
    chatId: "",
    lastSeen: "",
    contact: {
      profilePic: "",
      email: "",
      uid: ""
    },
    messages: []
  },
  allChats: [],
};

const lastMessageTs = (chat: Partial<Chat>): number => {
  const msgs = chat?.messages || [];
  const last = msgs[msgs.length - 1];
  return Number(last?.timestamp ?? 0);
};

const activityKey = (chat: Partial<Chat>): number => {
  return lastMessageTs(chat) || Number(chat?.lastModified ?? 0) || 0;
};

const compareChatsDesc = (a: Chat, b: Chat) => {
  const ka = activityKey(a);
  const kb = activityKey(b);
  if (ka !== kb) return kb - ka;
  return a.id < b.id ? -1 : a.id > b.id ? 1 : 0;
};

const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    setState: (state, action: PayloadAction<ChatState>) => action.payload,

    updateState: (state, action: PayloadAction<{ key: keyof ChatState; value: any }>) => {
      const { key, value } = action.payload;
      (state as any)[key] = value;
    },

    setUid: (state, action: PayloadAction<string>) => { state.uid = action.payload; },

    toggleShowChatInfo: (state) => { state.showChatInfo = !state.showChatInfo; },
    setShowDefaultImage: (state, action: PayloadAction<boolean>) => { state.showDefaultImage = action.payload; },
    setShowContactDefaultImage: (state, action: PayloadAction<boolean>) => { state.showContactDefaultImage = action.payload; },
    setShowNewChatModal: (state, action: PayloadAction<boolean>) => { state.showNewChatModal = action.payload; },

    setCurrentChat: (state, action: PayloadAction<CurrentChatState>) => { state.currentChat = action.payload; },

    updateCurrentChat: (state, action: PayloadAction<{ key: keyof CurrentChatState; value: any }>) => {
      const { key, value } = action.payload;
      (state.currentChat as any)[key] = value;
    },

    setAllChats: (state, action: PayloadAction<Chat[]>) => {
      const list = action.payload.slice();
      list.sort(compareChatsDesc);
      state.allChats = list;
    },

    updateAllChats: (state, action: PayloadAction<Chat>) => {
      state.allChats.push(action.payload);
      state.allChats.sort(compareChatsDesc);
    },

    updateChatByID: (state, action: PayloadAction<Chat>) => {
      const incoming = action.payload;
      const idx = state.allChats.findIndex(c => c.id === incoming.id);
      if (idx === -1) {
        state.allChats.push(incoming);
        state.allChats.sort(compareChatsDesc);
      } else {
        const prev = state.allChats[idx];
        const prevKey = activityKey(prev);
        const nextKey = activityKey(incoming);
        state.allChats[idx] = incoming;
        if (prevKey !== nextKey) {
          state.allChats.sort(compareChatsDesc);
        }
      }
      if (state.currentChat?.chatId === incoming.id) {
        if (incoming.participants) state.currentChat.participants = incoming.participants;
        if (incoming.messages) state.currentChat.messages = incoming.messages;
        if (incoming.contact) state.currentChat.contact = incoming.contact;
      }
    },

    addMessageToCurrentChat: (state, action: PayloadAction<Message>) => {
      const newMessage = action.payload;
      state.currentChat.messages.push(newMessage);
      
      const idx = state.allChats.findIndex(c => c.id === state.currentChat.chatId);
      if (idx !== -1) {
        state.allChats[idx].messages.push(newMessage);
        state.allChats.sort(compareChatsDesc);
      }
    },

    removeChatByID: (state, action: PayloadAction<string>) => {
      const id = action.payload;
      state.allChats = state.allChats.filter(c => c.id !== id);
      if (state.currentChat?.chatId === id) {
        state.currentChat = { ...initialState.currentChat };
      }
    },

    upsertChatSorted: (state, action: PayloadAction<Chat>) => {
      const incoming = action.payload;
      const idx = state.allChats.findIndex(c => c.id === incoming.id);
      if (idx === -1) {
        state.allChats.push(incoming);
        state.allChats.sort(compareChatsDesc);
      } else {
        const prev = state.allChats[idx];
        const prevKey = activityKey(prev);
        const nextKey = activityKey(incoming);
        state.allChats[idx] = incoming;
        if (prevKey !== nextKey) {
          state.allChats.sort(compareChatsDesc);
        }
      }
      if (state.currentChat?.chatId === incoming.id) {
        if (incoming.participants) state.currentChat.participants = incoming.participants;
        if (incoming.messages) state.currentChat.messages = incoming.messages;
        if (incoming.contact) state.currentChat.contact = incoming.contact;
      }
    },

    updateChatParticipantsById: (state, action: PayloadAction<{ chatId: string; participants: Participant[] }>) => {
      const { chatId, participants } = action.payload;
      const idx = state.allChats.findIndex(c => c.id === chatId);
      if (idx !== -1) {
        state.allChats[idx].participants = participants;
      }
      if (state.currentChat.chatId === chatId) {
        state.currentChat.participants = participants;
      }
    },

    toggleParticipantFlag: (state, action: PayloadAction<{ chatId: string; userId: string; field: keyof Participant; value?: boolean }>) => {
      const { chatId, userId, field, value } = action.payload;
      const apply = (list: Participant[]) =>
        list.map(p => (p.userID === userId ? { ...p, [field]: typeof value === 'boolean' ? value : !p[field] } : p));

      const idx = state.allChats.findIndex(c => c.id === chatId);
      if (idx !== -1 && Array.isArray(state.allChats[idx].participants)) {
        state.allChats[idx].participants = apply(state.allChats[idx].participants);
      }
      if (state.currentChat.chatId === chatId && Array.isArray(state.currentChat.participants)) {
        state.currentChat.participants = apply(state.currentChat.participants as Participant[]);
      }
    },

    updateContact: (state, action: PayloadAction<Partial<ChatContact>>) => {
      state.currentChat.contact = { ...state.currentChat.contact, ...action.payload };
    },

    resetChatState: () => initialState,
  },
});

export const {
  toggleShowChatInfo,
  updateContact,
  setState,
  updateState,
  setUid,
  setCurrentChat,
  updateCurrentChat,
  setAllChats,
  updateAllChats,
  addMessageToCurrentChat,
  updateChatByID,
  resetChatState,
  setShowContactDefaultImage,
  setShowNewChatModal,
  setShowDefaultImage,
  upsertChatSorted,
  removeChatByID,
  updateChatParticipantsById,
  toggleParticipantFlag,
} = chatSlice.actions;

export default chatSlice.reducer;
