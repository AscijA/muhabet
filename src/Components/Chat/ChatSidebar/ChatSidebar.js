import React from 'react';
import styles from "./ChatSidebar.module.scss";
import ChatItem from './ChatItem/ChatItem';

export default function ChatSidebar() {
  return (
    <div className={ styles.main }>
      <ChatItem />
    </div>
  );
}
