import { openDB, DBSchema, IDBPDatabase } from 'idb';

interface MyDB extends DBSchema {
  contacts: {
    key: [string, string];
    value: {
      ownerID: string;
      id: string;
      image: Blob;
    };
  };
  chats: {
    key: [string, string];
    value: {
      chatID: string;
      imageID: string;
      image: Blob;
    };
  };
}

const DB_NAME = 'muhabet-image-cache';
const CONTACT_STORE = 'contacts';
const CHAT_STORE = 'chats';

export const initDB = async (): Promise<IDBPDatabase<MyDB>> => {
  return openDB<MyDB>(DB_NAME, 2, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(CONTACT_STORE)) {
        db.createObjectStore(CONTACT_STORE, { keyPath: ['ownerID', 'id'] });
      }
      if (!db.objectStoreNames.contains(CHAT_STORE)) {
        db.createObjectStore(CHAT_STORE, { keyPath: ['chatID', 'imageID'] });
      }
    },
  });
};

export const saveContactImage = async (ownerID: string, id: string, imageBlob: Blob) => {
  const db = await initDB();
  await db.put(CONTACT_STORE, { ownerID, id, image: imageBlob });
};

export const saveChatImage = async (chatID: string, imageID: string, imageBlob: Blob) => {
  const db = await initDB();
  await db.put(CHAT_STORE, { chatID, imageID, image: imageBlob });
};

export const getContactImage = async (ownerID: string, id: string): Promise<Blob | undefined> => {
  const db = await initDB();
  const data = await db.get(CONTACT_STORE, [ownerID, id]);
  return data?.image;
};

export const getChatImages = async (chatID: string) => {
  const db = await initDB();
  const allImages = await db.getAll(CHAT_STORE);
  return allImages.filter(image => image.chatID === chatID);
};

export const deleteContactImage = async (ownerID: string, id: string) => {
  const db = await initDB();
  await db.delete(CONTACT_STORE, [ownerID, id]);
};

export const clearContactImages = async (ownerID: string) => {
  const db = await initDB();
  const keys = await db.getAllKeys(CONTACT_STORE);
  await Promise.all(keys.filter(([owner]) => owner === ownerID).map(key => db.delete(CONTACT_STORE, key)));
};

export const deleteChatImage = async (chatID: string, imageID: string) => {
  const db = await initDB();
  await db.delete(CHAT_STORE, [chatID, imageID]);
};

export const getImageFromFirebaseAndSaveToIDB = (ownerID: string, uid: string, url: string) => {
  const xhr = new XMLHttpRequest();
  xhr.responseType = 'blob';
  xhr.onload = () => {
    const blob = xhr.response;
    saveContactImage(ownerID, uid, blob);
  };
  xhr.open('GET', url);
  xhr.send();
};
