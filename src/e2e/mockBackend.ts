import { Chat, Message, Participant } from "src/types";

export const E2E_ENABLED = import.meta.env.VITE_E2E === "true";
export const E2E_SESSION_KEY = "muhabet-e2e-session";

export const E2E_USER = {
  uid: "user-me",
  email: "alex@example.com",
  displayName: "Alex",
  emailVerified: true,
  createdAt: "2025-01-01T00:00:00.000Z",
  contacts: [],
  profilePic: "",
  settings: null,
};

const baseChats: Chat[] = [
  {
    id: "chat-sam", chatId: "chat-sam", participantIDs: ["user-me", "user-sam"],
    participants: [
      { userID: "user-me", email: "alex@example.com", blockStatus: false, deleteStatus: false },
      { userID: "user-sam", email: "sam@example.com", blockStatus: false, deleteStatus: false },
    ],
    lastModified: "2026-09-13T09:30:00.000Z",
    messages: [
      { messageID: "m1", content: "Are we still on for coffee?", contentType: "text", ownerID: "user-sam", timestamp: "2026-09-13T09:28:00.000Z", messageStatus: "SEEN" },
      { messageID: "m2", content: "Absolutely — see you at ten.", contentType: "text", ownerID: "user-me", timestamp: "2026-09-13T09:30:00.000Z", messageStatus: "SEEN" },
    ],
    lastMessageStatus: { status: "SEEN", userID: "user-me" },
  },
  {
    id: "chat-jordan", chatId: "chat-jordan", participantIDs: ["user-me", "user-jordan"],
    participants: [
      { userID: "user-me", email: "alex@example.com", blockStatus: false, deleteStatus: false },
      { userID: "user-jordan", email: "jordan@example.com", blockStatus: false, deleteStatus: false },
    ],
    lastModified: "2026-09-12T15:00:00.000Z",
    messages: [{ messageID: "m3", content: "Sent you the notes.", contentType: "text", ownerID: "user-jordan", timestamp: "2026-09-12T15:00:00.000Z", messageStatus: "DELIVERED" }],
    lastMessageStatus: { status: "", userID: "" },
  },
];

let chats: Chat[] = structuredClone(baseChats);
let listeners: Array<(value: Chat[]) => void> = [];

const emit = () => listeners.forEach(listener => listener(structuredClone(chats)));
export const resetE2EBackend = () => { chats = structuredClone(baseChats); emit(); };
export const getE2EChats = () => structuredClone(chats);
export const subscribeE2EChats = (listener: (value: Chat[]) => void) => {
  listeners.push(listener); listener(getE2EChats());
  return () => { listeners = listeners.filter(item => item !== listener); };
};

export const addE2EMessage = (chatID: string, message: Message) => {
  chats = chats.map(chat => chat.id === chatID ? { ...chat, messages: [...chat.messages, message], lastModified: message.timestamp } : chat);
  emit();
};

export const updateE2EMessage = (chatID: string, messageID: string, updates: Partial<Message>) => {
  chats = chats.map(chat => chat.id === chatID ? { ...chat, messages: chat.messages.map(message => message.messageID === messageID ? { ...message, ...updates } : message) } : chat);
  emit();
};

export const updateE2EParticipants = (chatID: string, participants: Participant[]) => {
  chats = chats.map(chat => chat.id === chatID ? { ...chat, participants } : chat); emit();
};

export const createE2EChat = (email: string) => {
  const id = `chat-${email.split("@")[0]}`;
  const chat: Chat = {
    id, chatId: id, participantIDs: [E2E_USER.uid, `user-${email}`],
    participants: [
      { userID: E2E_USER.uid, email: E2E_USER.email, blockStatus: false, deleteStatus: false },
      { userID: `user-${email}`, email, blockStatus: false, deleteStatus: false },
    ], messages: [], lastModified: Date.now(), lastMessageStatus: { status: "", userID: "" },
  };
  chats = [chat, ...chats]; emit(); return id;
};
