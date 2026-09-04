import { openDB, DBSchema, IDBPDatabase } from 'idb';

interface MyDB extends DBSchema {
  contacts: {
    key: string;
    value: {
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

const DB_NAME = 'imageStore';
const CONTACT_STORE = 'contacts';
const CHAT_STORE = 'chats';

export const initDB = async (): Promise<IDBPDatabase<MyDB>> => {
  return openDB<MyDB>(DB_NAME, 1, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(CONTACT_STORE)) {
        db.createObjectStore(CONTACT_STORE, { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains(CHAT_STORE)) {
        db.createObjectStore(CHAT_STORE, { keyPath: ['chatID', 'imageID'] });
      }
    },
  });
};

export const saveContactImage = async (id: string, imageBlob: Blob) => {
  const db = await initDB();
  await db.put(CONTACT_STORE, { id, image: imageBlob });
};

export const saveChatImage = async (chatID: string, imageID: string, imageBlob: Blob) => {
  const db = await initDB();
  await db.put(CHAT_STORE, { chatID, imageID, image: imageBlob });
};

export const getContactImage = async (id: string): Promise<Blob | undefined> => {
  const db = await initDB();
  const data = await db.get(CONTACT_STORE, id);
  return data?.image;
};

export const getChatImages = async (chatID: string) => {
  const db = await initDB();
  const allImages = await db.getAll(CHAT_STORE);
  return allImages.filter(image => image.chatID === chatID);
};

export const deleteContactImage = async (id: string) => {
  const db = await initDB();
  await db.delete(CONTACT_STORE, id);
};

export const deleteChatImage = async (chatID: string, imageID: string) => {
  const db = await initDB();
  await db.delete(CHAT_STORE, [chatID, imageID]);
};

export const getImageFromFirebaseAndSaveToIDB = (uid: string, url: string) => {
  const xhr = new XMLHttpRequest();
  xhr.responseType = 'blob';
  xhr.onload = (event) => {
    const blob = xhr.response;
    saveContactImage(uid, blob);
  };
  xhr.open('GET', url);
  xhr.send();
};