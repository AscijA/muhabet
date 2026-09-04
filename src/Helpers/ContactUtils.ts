import { storage } from "../Firebase/firebase";
import { ref, getDownloadURL } from "firebase/storage";
import { getContactImage, getImageFromFirebaseAndSaveToIDB } from "src/Helpers/idb";
import { AppDispatch } from "src/store/store";
import { ChatContact } from "src/types";

export const fetchProfilePicture = async (
  contactUID: string | undefined | null,
  setProfilePic: (url: string) => void,
  setShowUser: (show: boolean) => void
) => {
  try {
    if (!contactUID) return;

    const image = await getContactImage(contactUID);
    if (image) {
      setProfilePic(URL.createObjectURL(image));
      setShowUser(true);
    }

    const contactRef = ref(storage, `profile-pics/${contactUID}`);
    const url = await getDownloadURL(contactRef);
    setProfilePic(url);
    setShowUser(true);
  } catch (error) {
    console.error("Error fetching profile picture:", error);
  }
};

export const fetchAndUpdateContactProfile = async (
  contactUID: string | undefined | null,
  currentProfilePic: string,
  updateContact: any,
  dispatch: AppDispatch
) => {
  try {
    if (!contactUID || currentProfilePic) return;

    const contactRef = ref(storage, `profile-pics/${contactUID}`);
    const url = await getDownloadURL(contactRef);

    if (currentProfilePic !== url) {
      dispatch(updateContact({ profilePic: url }));
    }
  } catch (error) {
    console.error("Error fetching contact profile pic:", error);
  }
};

export const fetchContactProfile = async (
  contactUID: string | undefined | null,
  dispatch: AppDispatch,
  updateContact: any,
  setShowContactDefaultImage: any
) => {
  try {
    if (!contactUID) return;
    
    const image = await getContactImage(contactUID);
    if (image) {
      dispatch(updateContact({ profilePic: URL.createObjectURL(image) }));
      dispatch(setShowContactDefaultImage(false));
    }
    
    const contactRef = ref(storage, `profile-pics/${contactUID}`);
    const url = await getDownloadURL(contactRef);
    dispatch(updateContact({ profilePic: url }));
    dispatch(setShowContactDefaultImage(false));
    
    getImageFromFirebaseAndSaveToIDB(contactUID, url);
  } catch (error) {
    dispatch(setShowContactDefaultImage(true));
    console.error("Error fetching contact profile pic:", error);
  }
};