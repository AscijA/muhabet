import React, { useEffect } from 'react';
import SideBar from "../Common/SideBar/SideBar";
import Nav from "../Nav/Nav";
import ChatSidebar from './ChatSidebar/ChatSidebar';
import styles from "./Chat.module.scss";
import ChatContent from './ChatContent/ChatContent';
import { useDispatch } from 'react-redux';
import { onAuthStateChanged } from 'firebase/auth';
import { fetchChats, userSetUp } from '../../Helpers/DataLoading';
import { auth } from '../../Firebase/firebase';
// import BasicModal from '../Common/BasicModal/BasicModal';

function Chat() {

  const dispatch = useDispatch();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        userSetUp(user, dispatch);
        fetchChats(user.uid, dispatch);

      }
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, [dispatch]);

  return (
    <div className={ styles.main }>
      <Nav />
      <div className={ styles.content }>
        <SideBar isChat={ true }>
          <ChatSidebar />

        </SideBar>

        <ChatContent />
      </div>
    </div>
  );
}

export default Chat;