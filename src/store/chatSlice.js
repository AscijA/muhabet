import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  uid: "",
  showChatInfo: false,
  showDefaultImage: true,
  showContactDefaultImage: false,
  showNewChatModal: false,
  currentChat: {
    chatId: 0,
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

const lastMessageTs = (chat) => {
  const msgs = chat?.messages || [];
  const last = msgs[msgs.length - 1];
  return last?.timestamp ?? 0;
};

const activityKey = (chat) => {
  return lastMessageTs(chat) || chat?.createdAt || 0;
};

const compareChatsDesc = (a, b) => {
  const ka = activityKey(a);
  const kb = activityKey(b);
  if (ka !== kb) return kb - ka;
  return a.id < b.id ? -1 : a.id > b.id ? 1 : 0;
};

const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    setState: (state, action) => action.payload,

    updateState: (state, action) => {
      const { key, value } = action.payload;
      return { ...state, [key]: value };
    },

    setUid: (state, action) => ({ ...state, uid: action.payload }),

    toggleShowChatInfo: (state) => ({ ...state, showChatInfo: !state.showChatInfo }),
    setShowDefaultImage: (state, action) => ({ ...state, showDefaultImage: action.payload }),
    setShowContactDefaultImage: (state, action) => ({ ...state, showContactDefaultImage: action.payload }),
    setShowNewChatModal: (state, action) => ({ ...state, showNewChatModal: action.payload }),

    setCurrentChat: (state, action) => ({ ...state, currentChat: action.payload }),

    updateCurrentChat: (state, action) => {
      const { key, value } = action.payload;
      return { ...state, currentChat: { ...state.currentChat, [key]: value } };
    },

    setAllChats: (state, action) => {
      const list = Array.isArray(action.payload) ? action.payload.slice() : [];
      list.sort(compareChatsDesc);
      return { ...state, allChats: list };
    },

    updateAllChats: (state, action) => {
      const next = [...state.allChats, action.payload];
      next.sort(compareChatsDesc);
      return { ...state, allChats: next };
    },

    updateChatByID: (state, action) => {
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
        const merged = {
          ...state.currentChat,
          ...(['participants', 'messages', 'contact'].reduce((acc, k) => {
            if (k in incoming) acc[k] = incoming[k];
            return acc;
          }, {})),
        };
        state.currentChat = merged;
      }
    },

    addMessageToCurrentChat: (state, action) => {
      const newMessage = action.payload;
      state.currentChat = {
        ...state.currentChat,
        messages: [...(state.currentChat.messages || []), newMessage],
      };
      const idx = state.allChats.findIndex(c => c.id === state.currentChat.chatId);
      if (idx !== -1) {
        const updated = {
          ...state.allChats[idx],
          messages: [...(state.allChats[idx].messages || []), newMessage],
        };
        state.allChats[idx] = updated;
        state.allChats.sort(compareChatsDesc);
      }
    },

    removeChatByID: (state, action) => {
      const id = action.payload;
      state.allChats = state.allChats.filter(c => c.id !== id);
      if (state.currentChat?.chatId === id) {
        state.currentChat = { ...initialState.currentChat };
      }
    },

    upsertChatSorted: (state, action) => {
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
        const merged = {
          ...state.currentChat,
          ...(['participants', 'messages', 'contact'].reduce((acc, k) => {
            if (k in incoming) acc[k] = incoming[k];
            return acc;
          }, {})),
        };
        state.currentChat = merged;
      }
    },

    updateChatParticipantsById: (state, action) => {
      const { chatId, participants } = action.payload;
      const idx = state.allChats.findIndex(c => c.id === chatId);
      if (idx !== -1) {
        const incoming = { ...state.allChats[idx], participants };
        state.allChats[idx] = incoming;
      }
      if (state.currentChat.chatId === chatId) {
        state.currentChat = { ...state.currentChat, participants };
      }
    },

    toggleParticipantFlag: (state, action) => {
      const { chatId, userId, field, value } = action.payload;
      const apply = (list) =>
        list?.map(p => (p.userID === userId ? { ...p, [field]: typeof value === 'boolean' ? value : !p[field] } : p));

      const idx = state.allChats.findIndex(c => c.id === chatId);
      if (idx !== -1 && Array.isArray(state.allChats[idx].participants)) {
        state.allChats[idx] = {
          ...state.allChats[idx],
          participants: apply(state.allChats[idx].participants),
        };
      }
      if (state.currentChat.chatId === chatId && Array.isArray(state.currentChat.participants)) {
        state.currentChat = { ...state.currentChat, participants: apply(state.currentChat.participants) };
      }
    },

    updateContact: (state, action) => ({
      ...state,
      currentChat: {
        ...state.currentChat,
        contact: { ...state.currentChat.contact, ...action.payload },
      },
    }),

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
