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
        messages: [
            {}
        ]
    },

    allChats: [],
};
// ...imports and initialState unchanged

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

    updateCurrentChatParticipants: (state, action) => {
      return {
        ...state,
        currentChat: {
          ...state.currentChat,
          participants: action.payload,
        },
      };
    },

    setAllChats: (state, action) => ({ ...state, allChats: action.payload }),

    updateAllChats: (state, action) => ({ ...state, allChats: [...state.allChats, action.payload] }),

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

    updateChatParticipantsById: (state, action) => {
      const { chatId, participants } = action.payload;
      const idx = state.allChats.findIndex(c => c.id === chatId);
      if (idx !== -1) {
        state.allChats[idx] = {
          ...state.allChats[idx],
          participants,
        };
      }
      if (state.currentChat.chatId === chatId) {
        state.currentChat = {
          ...state.currentChat,
          participants,
        };
      }
    },

    toggleParticipantFlag: (state, action) => {
      const { chatId, userId, field, value } = action.payload; 
      const apply = (participants) =>
        participants?.map(p =>
          p.userID === userId
            ? { ...p, [field]: typeof value === 'boolean' ? value : !p[field] }
            : p
        );

      const idx = state.allChats.findIndex(c => c.id === chatId);
      if (idx !== -1 && Array.isArray(state.allChats[idx].participants)) {
        state.allChats[idx] = {
          ...state.allChats[idx],
          participants: apply(state.allChats[idx].participants),
        };
      }
      
      if (state.currentChat.chatId === chatId && Array.isArray(state.currentChat.participants)) {
        state.currentChat = {
          ...state.currentChat,
          participants: apply(state.currentChat.participants),
        };
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
  setShowDefaultImage,
  updateChatByID,
  resetChatState,
  setShowContactDefaultImage,
  setShowNewChatModal,

  updateCurrentChatParticipants,
  updateChatParticipantsById,
  toggleParticipantFlag,
} = chatSlice.actions;

export default chatSlice.reducer;
