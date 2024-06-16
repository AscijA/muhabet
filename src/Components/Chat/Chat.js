import React from 'react';
import SideBar from "../Common/SideBar/SideBar";
import Nav from "../Common/Nav/Nav";
import ChatSidebar from './ChatSidebar/ChatSidebar';
import styles from "./Chat.module.css";
import ChatContent from './ChatContent/ChatContent';
function Chat() {
  return (
    <div  className={ styles.main }>
      <Nav/>
      <div  className={ styles.content }>
        <SideBar isChat={ true }>
          <ChatSidebar />
        </SideBar>
        <ChatContent />
      </div>
    </div>
  );
}

export default Chat;