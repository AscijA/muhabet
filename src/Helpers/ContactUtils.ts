import { chatServices } from "src/app/chatServices";
import { updateContact as updateContactAction, setShowContactDefaultImage as setDefaultAction } from "src/store/chatSlice";
import { AppDispatch } from "src/store/store";

export const fetchProfilePicture = async (contactId: string | undefined | null, setPicture: (url: string) => void, setAvailable: (show: boolean) => void) => {
  if (!contactId) return;
  const image = await chatServices.profiles.getImage(contactId);
  if (!image) { setAvailable(false); return; }
  setPicture(image.url); setAvailable(true);
};

export const fetchAndUpdateContactProfile = async (contactId: string | undefined | null, currentPicture: string, updateContact: typeof updateContactAction, dispatch: AppDispatch) => {
  if (!contactId || currentPicture) return;
  const image = await chatServices.profiles.getImage(contactId);
  if (image) dispatch(updateContact({ profilePic: image.url }));
};

export const fetchContactProfile = async (contactId: string | undefined | null, dispatch: AppDispatch, updateContact: typeof updateContactAction, setDefault: typeof setDefaultAction) => {
  if (!contactId) return;
  const image = await chatServices.profiles.getImage(contactId);
  dispatch(setDefault(!image));
  if (image) dispatch(updateContact({ profilePic: image.url }));
};
