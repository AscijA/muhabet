import React, { useEffect, useState } from 'react';
import styles from "./Chat.module.scss";

import { useDispatch, useSelector } from 'react-redux';

import LoadingOverlay from '../Common/LoadingOverlay/LoadingOverlay';
import ChatContent from './ChatContent/ChatContent';
import ChatSidebar from './ChatSidebar/ChatSidebar';
import SideBar from "../Common/SideBar/SideBar";
import Nav from "../Nav/Nav";

import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../../Firebase/firebase';

import { fetchChats, userSetUp } from '../../Helpers/DataHandling';


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