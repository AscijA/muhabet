import React from 'react';
import styles from "./ChatSidebar.module.scss";

import { useSelector } from 'react-redux';

import ChatItem from './ChatItem/ChatItem';
import BasicModal from 'src/Components/Common/BasicModal/BasicModal';
import { setShowNewChatModal } from 'src/store/chatSlice';
import { useDispatch } from 'react-redux';
import NewChatModal from './NewChatModal/NewChatModal';

/** Chat sidebar containing all the chats
 */
const ChatSidebar = () => {
  const allChats = useSelector((state) => state.chat.allChats);
  let currentUser = useSelector((state) => state.user);
  let showNewChatModal = useSelector((state) => state.chat.showNewChatModal);
  let dispatch = useDispatch();

  const handleToggleNewChatModal = () => {
    dispatch(setShowNewChatModal(!showNewChatModal));
  };

  return (
    <>
      <div className={ styles.main }>
        <div>

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
        <div>
          <button className={ styles.newChatButton } onClick={ handleToggleNewChatModal }>New Chat</button>
        </div>
      </div>
      { showNewChatModal &&
        <BasicModal handleToggleModal={ handleToggleNewChatModal } fullscreen={ true } transparent={ true }>
          <NewChatModal handleToggleModal={ handleToggleNewChatModal }/>
        </BasicModal> }
    </>
  );
};
export default ChatSidebar;