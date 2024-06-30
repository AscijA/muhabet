import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  uid: "",
  currentChat: {
    chatId: "",
    lastSeen: "",
    contact: {
      profilePic: null,
      email: "",
    },
    messages: [
      {
        
      }
    ]
  },
  allChats: [],
};

const chatSlice = createSlice({
  name: 'chats',
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
          key: value

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
  },
});

export const { setState, updateState, setUid, updateUid, setCurrentChat, updateCurrentChat, setAllChats, updateAllChats } = chatSlice.actions;
export default chatSlice.reducer;
