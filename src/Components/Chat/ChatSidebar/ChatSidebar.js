import React from 'react';
import styles from "./ChatSidebar.module.scss";
import ChatItem from './ChatItem/ChatItem';
import { useSelector } from 'react-redux';

export default function ChatSidebar() {

  //const dispatch = useDispatch();
  const allChats = useSelector((state) => state.chat.allChats);
  let currentUser = useSelector((state) => state.user);

  return (
    <div className={ styles.main }>
      { allChats.map(chat => {
        var chatOwner = currentUser.uid === chat.user1ID ? chat.user2Email : chat.user1Email;
        var contactUID = currentUser.uid === chat.user1ID ? chat.user2ID : chat.user1ID;
        var deliveryStatus = currentUser.uid === chat.lastMessageStatus.userID ? chat.lastMessageStatus.status : "";
        return <ChatItem
          deliveryStatus={ deliveryStatus }
          email={ chatOwner }
          timestamp={ chat.lastModified }
          chat={ chat }
          key={ chat.id }
          contactUID={ contactUID }
          />;

      }) }
    </div>
  );
}
