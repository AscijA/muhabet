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
    messages: [{}]
  },
  allChats: [],
};

const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    // Replace entire state
    setState: (state, action) => action.payload,

    // Update a top-level key
    updateState: (state, action) => {
      const { key, value } = action.payload;
      return { ...state, [key]: value };
    },

    // Set the uid
    setUid: (state, action) => ({ ...state, uid: action.payload }),

    // UI toggles
    toggleShowChatInfo: (state) => ({ ...state, showChatInfo: !state.showChatInfo }),
    setShowDefaultImage: (state, action) => ({ ...state, showDefaultImage: action.payload }),
    setShowContactDefaultImage: (state, action) => ({ ...state, showContactDefaultImage: action.payload }),
    setShowNewChatModal: (state, action) => ({ ...state, showNewChatModal: action.payload }),

    // Current chat
    setCurrentChat: (state, action) => ({ ...state, currentChat: action.payload }),
    updateCurrentChat: (state, action) => {
      const { key, value } = action.payload;
      return { ...state, currentChat: { ...state.currentChat, [key]: value } };
    },

    // Chats collection
    setAllChats: (state, action) => ({ ...state, allChats: action.payload }),
    updateAllChats: (state, action) => ({ ...state, allChats: [...state.allChats, action.payload] }),

    // Upsert a chat (by id)
    updateChatByID: (state, action) => {
      const updatedChat = action.payload;
      const idx = state.allChats.findIndex(c => c.id === updatedChat.id);
      if (idx !== -1) state.allChats[idx] = updatedChat;
      else state.allChats.push(updatedChat);
    },

    addMessageToCurrentChat: (state, action) => {
      const newMessage = action.payload;
      state.currentChat.messages.push(newMessage);
      const idx = state.allChats.findIndex(c => c.id === state.currentChat.chatId);
      if (idx !== -1) state.allChats[idx].messages.push(newMessage);
    },

    // ✅ NEW: remove a chat by id (for docChanges 'removed')
    removeChatByID: (state, action) => {
      const id = action.payload;
      state.allChats = state.allChats.filter(c => c.id !== id);
    },

    // ✅ NEW: upsert a chat and keep allChats sorted by lastModified desc
    upsertChatSorted: (state, action) => {
      const chat = action.payload;
      const idx = state.allChats.findIndex(c => c.id === chat.id);
      if (idx !== -1) state.allChats[idx] = chat;
      else state.allChats.push(chat);

      const getMillis = (lm) => {
        if (!lm) return 0;
        if (typeof lm.toMillis === 'function') return lm.toMillis(); // Firestore Timestamp
        if (lm instanceof Date) return lm.getTime();
        if (typeof lm === 'number') return lm;
        const t = Date.parse(lm); // ISO string
        return Number.isNaN(t) ? 0 : t;
        // If you have a convertTimestamps step earlier, this stays robust.
      };

      state.allChats.sort((a, b) => getMillis(b.lastModified) - getMillis(a.lastModified));
    },

    // ✅ Optional helpers if you want to toggle flags locally:
    updateChatParticipantsById: (state, action) => {
      const { chatId, participants } = action.payload;
      const idx = state.allChats.findIndex(c => c.id === chatId);
      if (idx !== -1) {
        state.allChats[idx] = { ...state.allChats[idx], participants };
      }
      if (state.currentChat.chatId === chatId) {
        state.currentChat = { ...state.currentChat, participants };
      }
    },

    toggleParticipantFlag: (state, action) => {
      const { chatId, userId, field, value } = action.payload; // 'blockStatus' | 'deleteStatus'
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

    // Contact update
    updateContact: (state, action) => ({
      ...state,
      currentChat: {
        ...state.currentChat,
        contact: { ...state.currentChat.contact, ...action.payload },
      },
    }),

    // Reset
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

  // new
  upsertChatSorted,
  removeChatByID,
  updateChatParticipantsById,
  toggleParticipantFlag,
} = chatSlice.actions;

export default chatSlice.reducer;
