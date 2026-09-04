import { doc, updateDoc, collection, getDocs, query, where, orderBy, Timestamp, serverTimestamp, setDoc } from "firebase/firestore";
import { db } from "src/Firebase/firebase";
import { setAllChats, updateChatByID, ChatState } from "src/store/chatSlice";
import { UserState } from "src/store/userSlice";
import { AppDispatch } from "src/store/store";
import { Chat, Message, Participant } from "src/types";

export const fetchChats = async (userID: string, dispatch: AppDispatch) => {
  try {
    const chatsRef = collection(db, "chats");

    const q = query(
      chatsRef,
      where("participantIDs", "array-contains", userID),
      orderBy("lastModified", "desc")
    );

    const snapshot = await getDocs(q);

    const chats = snapshot.docs.map(docSnap => ({
      id: docSnap.id,
      ...convertTimestamps(docSnap.data()),
    })) as Chat[];

    dispatch(setAllChats(chats));
  } catch (error) {
    console.error("Error fetching chats:", error);
  }
};

const convertTimestamps = (docData: any) => {
  if (docData.lastModified instanceof Timestamp) {
    docData.lastModified = docData.lastModified.toDate().toISOString();
  }

  if (docData.messages) {
    docData.messages = docData.messages.map((msg: any) => ({
      ...msg,
      timestamp: msg.timestamp instanceof Timestamp ? msg.timestamp.toDate().toISOString() : msg.timestamp
    }));
  }

  return docData;
};

export const updateChatParticipants = async (chatID: string, participants: Participant[]) => {
  const chatRef = doc(db, "chats", chatID);
  const participantIDs = Array.isArray(participants)
    ? participants.map(p => p.userID)
    : [];
  await updateDoc(chatRef, {
    participants,
    participantIDs,
    lastModified: serverTimestamp(),
  });
};

export const createChat = async (chatData: Partial<Chat>): Promise<string | undefined> => {
  try {
    const chatRef = doc(collection(db, "chats"));
    const participantIDs = Array.isArray(chatData.participants)
      ? chatData.participants.map(p => p.userID)
      : [];

    await setDoc(chatRef, {
      ...chatData,
      chatId: chatRef.id,
      participantIDs,
      lastModified: serverTimestamp(),
    });

    return chatRef.id;
  } catch (error) {
    console.error("Error creating chat:", error);
  }
};

export const handleChatStatus = (
  type = "block",
  chat: ChatState,
  currentUser: UserState,
  dispatch: AppDispatch,
  handleShowContactInfoToggle: (() => void) | null = null
) => {
  const { currentChat, allChats } = chat;
  let currentChatFull = allChats.find(c => c.id === currentChat.chatId);
  const currentUserUid = currentUser.uid;

  if (!currentChatFull?.participants) return;

  const updatedParticipants = currentChatFull.participants.map(p => {
    if (p.userID !== currentUserUid) return p;
    if (type === "delete") {
      return { ...p, deleteStatus: !p.deleteStatus };
    }
    return { ...p, blockStatus: !p.blockStatus };
  });

  const updatedChat: Chat = {
    ...currentChatFull,
    participants: updatedParticipants
  };

  const dispatchChatUpdate = () => {
    dispatch(updateChatByID(updatedChat));
    if (handleShowContactInfoToggle) handleShowContactInfoToggle();
  };

  updateChatParticipants(currentChat.chatId, updatedParticipants)
    .then(() => dispatchChatUpdate())
    .catch((error) => {
      console.error("Error updating chat:", error);
    });
};

export const updateChat = async (key: string, value: any, chatID: string) => {
  const chatRef = doc(db, "chats", chatID);
  await updateDoc(chatRef, { [key]: value, lastModified: serverTimestamp() });
};

export const updateChatNoModify = async (key: string, value: any, chatID: string) => {
  const chatRef = doc(db, "chats", chatID);
  await updateDoc(chatRef, { [key]: value });
};

export const addMessageToSubcollection = async (chatID: string, message: Message) => {
  const msgRef = doc(collection(db, "chats", chatID, "messages"), message.messageID);
  await setDoc(msgRef, message);
  await updateDoc(doc(db, "chats", chatID), { lastModified: serverTimestamp() });
};

export const updateMessageInSubcollection = async (chatID: string, messageID: string, updates: Partial<Message>) => {
  const msgRef = doc(db, "chats", chatID, "messages", messageID);
  await updateDoc(msgRef, updates);
};
