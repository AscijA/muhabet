import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  uid: "",
  showChatInfo: false,
  currentChat: {
    chatId: "",
    lastSeen: "",
    contact: {
      profilePic: "",
      email: "mascija111@gmail.com",
    },
    messages: [
      {

      }
    ]
  },
  allChats: [],
};

const chatSlice = createSlice({
  name: 'chat',
  initialState: initialState,
  reducers: {
    // Set the entire state
    setState: (state, action) => {
      return action.payload;
    },

    // Update a specific key in the state
    updateState: (state, action) => {
      const { key, value } = action.payload;
      return {
        ...state,
        [key]: value
      };
    },

    // Set the uid
    setUid: (state, action) => {
      return {
        ...state,
        uid: action.payload
      };
    },


    toggleShowChatInfo: (state, action) => {
      return {
        ...state,
        showChatInfo: !state.showChatInfo
      };
    },

    // Set the currentChat
    setCurrentChat: (state, action) => {
      return {
        ...state,
        currentChat: action.payload
      };
    },

    // Update the currentChat
    updateCurrentChat: (state, action) => {
      const { key, value } = action.payload;

      return {
        ...state,
        currentChat: {
          ...state.value.currentChat,
          [key]: value

        }
      };
    },

    // Set allChats
    setAllChats: (state, action) => {
      return {
        ...state,
        allChats: action.payload
      };
    },

    // Update allChats (e.g., append a new chat)
    updateAllChats: (state, action) => {
      return {
        ...state,
        allChats: [...state.allChats, action.payload]
      };
    },

    updateContact: (state, action) => {
      return {
        ...state,
        currentChat: {
          ...state.currentChat,
          contact: {
            ...state.currentChat.contact,
            ...action.payload
          }
        }
      };
    }
  },
});

export const { toggleShowChatInfo, updateContact, setState, updateState, setUid, updateUid, setCurrentChat, updateCurrentChat, setAllChats, updateAllChats } = chatSlice.actions;
export default chatSlice.reducer;
