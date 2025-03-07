import React, { useEffect, useState } from 'react';
import styles from "./Chat.module.scss";

import { useDispatch, useSelector } from 'react-redux';

import LoadingOverlay from '../Common/LoadingOverlay/LoadingOverlay';
import ChatContent from './ChatContent/ChatContent';
import ChatSidebar from './ChatSidebar/ChatSidebar';
import SideBar from "../Common/SideBar/SideBar";
import Nav from "../Nav/Nav";

import { auth, storage } from '../../Firebase/firebase';
import { ref, getDownloadURL } from "firebase/storage";
import { onAuthStateChanged } from 'firebase/auth';

import { getContactImage, getImageFromFirebaseAndSaveToIDB } from 'src/Helpers/idb';
import { fetchChats, userSetUp } from '../../Helpers/DataHandling';
import { setShowDefaultImage } from 'src/store/chatSlice';
import { updateUser } from 'src/store/userSlice';


/**
 * Main Chat component all of the chat components, nav and sidebar
 */
const Chat = () => {
  const dispatch = useDispatch();
  const currentChat = useSelector((state) => state.chat.currentChat);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        userSetUp(user, dispatch);

        getContactImage(user.uid).then((image) => {
          if (image) {
            dispatch(updateUser({ profilePic: URL.createObjectURL(image) }));
            dispatch(setShowDefaultImage(false));
          }
          const gsRef = ref(storage, `profile-pics/${auth.currentUser.uid}`);
          getDownloadURL(gsRef)
            .then((url) => {
              dispatch(updateUser({ profilePic: url }));
              dispatch(setShowDefaultImage(false));

              getImageFromFirebaseAndSaveToIDB(user.uid, url)
              
            })
            .catch((error) => {
              console.error("Error fetching user profile pic:", error);
            });
        });


        fetchChats(user.uid, dispatch)
          .then(() => setLoading(false
          ))
          .catch((error) => {
            console.error("Error fetching chats:", error);
          });
      }
    });

    return () => unsubscribe();
  }, [dispatch]);

  return (
    <div className={ styles.main }>
      { loading && <LoadingOverlay /> }
      <Nav />
      <div className={ styles.content }>
        <SideBar
          isChat={ true }>
          <ChatSidebar />

        </SideBar>

        { currentChat.contact.email && (<ChatContent />) }
      </div>
    </div>
  );
};

export default Chat;