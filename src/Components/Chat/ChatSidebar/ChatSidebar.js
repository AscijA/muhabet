import React from 'react';
import styles from "./ChatSidebar.module.scss";
import ChatItem from './ChatItem/ChatItem';
import { MESSAGE_STATUS } from 'src/Helpers/Constants';
import { useSelector, useDispatch  } from 'react-redux';



export default function ChatSidebar() {
  const dispatch = useDispatch();
  const allChats = useSelector((state) => state.chat);

  return (
    <div className={ styles.main }>
      <ChatItem deliveryStatus={ MESSAGE_STATUS.SENT } email="mascija111@gmail.com" />
    </div>
  );
}
