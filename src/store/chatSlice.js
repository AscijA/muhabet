import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    uid: "",
    showChatInfo: false,
    showDefaultImage: true,
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

        setShowDefaultImage: (state, action) => {
            return {
                ...state,
                showDefaultImage: action.payload
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
                    ...state.currentChat,
                    [key]: value

                }
            };
        },

        updateChatStatus: (state, action) => {
            return {
                ...state,
                currentChat: {
                    ...state.currentChat,
                    chatStatus: action.payload
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

        updateChatByID: (state, action) => {
            const updatedChat = action.payload;
            
            // Find the chat in allChats that matches the current chatId
            const chatIndex = state.allChats.findIndex(
                (chat) => chat.id === updatedChat.id
            );
            
            if (chatIndex !== -1) {
                state.allChats[chatIndex] = updatedChat;
            }
        },

        addMessageToCurrentChat: (state, action) => {
            const newMessage = action.payload;

            // Update the currentChat messages
            state.currentChat.messages.push(newMessage);
            console.log(newMessage);
            // Find the chat in allChats that matches the current chatId
            const chatIndex = state.allChats.findIndex(
                (chat) => chat.id === state.currentChat.chatId
            );

            // If the chat exists in allChats, update the messages
            if (chatIndex !== -1) {
                state.allChats[chatIndex].messages.push(newMessage);
            }
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

export const {
    toggleShowChatInfo,
    updateContact,
    setState,
    updateState,
    setUid,
    updateUid,
    setCurrentChat,
    updateCurrentChat,
    setAllChats,
    updateAllChats,
    addMessageToCurrentChat,
    setShowDefaultImage,
    updateChatStatus,
    updateChatByID,
} = chatSlice.actions;
export default chatSlice.reducer;
