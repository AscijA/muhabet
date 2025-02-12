import React from 'react';
import styles from "./ChatSidebar.module.scss";
import ChatItem from './ChatItem/ChatItem';
import { MESSAGE_STATUS } from 'src/Helpers/Constants';

export default function ChatSidebar() {
  return (
    <div className={ styles.main }>
      <ChatItem deliveryStatus={MESSAGE_STATUS.SENT} email="mascija111@gmail.com"/>
    </div>
  );
}
