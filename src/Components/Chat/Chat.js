import React, { useEffect, useState } from 'react';
import styles from "./Chat.module.scss";

import { useDispatch, useSelector } from 'react-redux';

import { subscribeToAuthChangesOnChatLoad } from 'src/Helpers/AuthUtils';

import LoadingOverlay from '../Common/LoadingOverlay/LoadingOverlay';
import ChatContent from './ChatContent/ChatContent';
import ChatSidebar from './ChatSidebar/ChatSidebar';
import SideBar from "../Common/SideBar/SideBar";
import Nav from "../Nav/Nav";

/**
 * Main Chat component all of the chat components, nav and sidebar
 */
const Chat = () => {
  const dispatch = useDispatch();
  const currentChat = useSelector((state) => state.chat.currentChat);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = subscribeToAuthChangesOnChatLoad(dispatch, setLoading);
    return () => unsubscribe();
  }, [dispatch]);

  return (
    <div className={ styles.main }>
      { loading && <LoadingOverlay /> }
      <Nav />
      <div className={ styles.content }>
        <SideBar isChat={ true }>
          <ChatSidebar />
        </SideBar>

        { currentChat.contact.email && (<ChatContent />) }
      </div>
    </div>
  );
};

export default Chat;
