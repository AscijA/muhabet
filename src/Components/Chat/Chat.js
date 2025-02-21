import React, { useEffect } from 'react';
import styles from "./Chat.module.scss";

import { useDispatch, useSelector } from 'react-redux';

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

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        userSetUp(user, dispatch);
        fetchChats(user.uid, dispatch);
      }
    });

    return () => unsubscribe();
  }, [dispatch]);

  return (
    <div className={ styles.main }>
      <Nav />
      <div className={ styles.content }>
        <SideBar 
        isChat={ true }>
          <ChatSidebar />

        </SideBar>

        {currentChat.contact.email && (<ChatContent />)}
      </div>
    </div>
  );
}

export default Chat;