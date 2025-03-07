import { openDB } from 'idb';

const DB_NAME = 'imageStore';
const CONTACT_STORE = 'contacts';
const CHAT_STORE = 'chats';

export const initDB = async () => {
  return openDB(DB_NAME, 1, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(CONTACT_STORE)) {
        db.createObjectStore(CONTACT_STORE, { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains(CHAT_STORE)) {
        // Use both chatID and imageID as keys (compound key)
        db.createObjectStore(CHAT_STORE, { keyPath: ['chatID', 'imageID'] });
      }
    },
  });
};

// Save Contact Image
export const saveContactImage = async (id, imageBlob) => {
  const db = await initDB();
  await db.put(CONTACT_STORE, { id, image: imageBlob });
};

// Save Chat Image with chatID
export const saveChatImage = async (chatID, imageID, imageBlob) => {
  const db = await initDB();
  await db.put(CHAT_STORE, { chatID, imageID, image: imageBlob });
};

// Retrieve Contact Image
export const getContactImage = async (id) => {
  const db = await initDB();
  const data = await db.get(CONTACT_STORE, id);
  return data?.image;
};

// Retrieve Chat Images by chatID
export const getChatImages = async (chatID) => {
  const db = await initDB();
  const allImages = await db.getAll(CHAT_STORE);
  return allImages.filter(image => image.chatID === chatID);
};

// Delete Contact Image
export const deleteContactImage = async (id) => {
  const db = await initDB();
  await db.delete(CONTACT_STORE, id);
};

// Delete Chat Image by chatID and imageID
export const deleteChatImage = async (chatID, imageID) => {
  const db = await initDB();
  await db.delete(CHAT_STORE, [chatID, imageID]);
};


export const getImageFromFirebaseAndSaveToIDB = (uid, url) => {
  const xhr = new XMLHttpRequest();
  xhr.responseType = 'blob';
  xhr.onload = (event) => {
    const blob = xhr.response;
    saveContactImage(uid, blob);
  };
  xhr.open('GET', url);
  xhr.send();
};