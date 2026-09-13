import React, { useEffect, useState } from 'react';
import styles from "./Chat.module.scss";

import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

import { subscribeToAuthChangesOnChatLoad } from 'src/Helpers/ChatAuthUtils';

import LoadingOverlay from '../Common/LoadingOverlay/LoadingOverlay';
import ChatContent from './ChatContent/ChatContent';
import ChatSidebar from './ChatSidebar/ChatSidebar';
import SideBar from "../Common/SideBar/SideBar";
import Nav from "../Nav/Nav";
import { selectCurrentChat } from 'src/store/chatSlice';
import { useNetworkStatus } from 'src/application/network/useNetworkStatus';

/**
 * Main Chat component all of the chat components, nav and sidebar
 */
const Chat = () => {
  const dispatch = useDispatch();
  const currentChat = useSelector(selectCurrentChat);
  const connectionState = useSelector((state: import('src/store/store').RootState) => state.chat.connectionState);
  useNetworkStatus();

  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = subscribeToAuthChangesOnChatLoad(dispatch, setLoading, navigate);
    return () => unsubscribe();
  }, [dispatch, navigate]);

  return (
    <div className={ styles.main }>
      { loading && <LoadingOverlay /> }
      <Nav />
      { connectionState === "offline" && <div className={ styles.connectionBanner } role="status">Offline. Messages will need to be retried when you reconnect.</div> }
      <div className={ styles.content }>
        <SideBar isChat={ true }>
          <ChatSidebar />
        </SideBar>

        { currentChat.contact.email ? (<ChatContent />) : (
          <div className={ styles.emptyState }>
            <div className={ styles.emptyMark } aria-hidden="true">•••</div>
            <h1>Your conversations live here.</h1>
            <p>Choose someone from the list or start a new chat.</p>
          </div>
        ) }
      </div>
    </div>
  );
};

export default Chat;
