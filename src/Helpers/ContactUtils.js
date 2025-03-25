import { storage } from "../Firebase/firebase";
import { ref, getDownloadURL } from "firebase/storage";
import { getContactImage, getImageFromFirebaseAndSaveToIDB } from "src/Helpers/idb";

const fetchProfilePicture = async (contactUID, setProfilePic, setShowUser) => {
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

const fetchAndUpdateContactProfile = async (contactUID, currentProfilePic, updateContact, dispatch) => {
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

const fetchContactProfile = async (contactUID, dispatch, updateContact, setShowContactDefaultImage) => {
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
    
    await getImageFromFirebaseAndSaveToIDB(contactUID, url);
  } catch (error) {
    dispatch(setShowContactDefaultImage(true));
    console.error("Error fetching contact profile pic:", error);
  }
};

export { fetchProfilePicture, fetchAndUpdateContactProfile, fetchContactProfile };