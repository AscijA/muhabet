import React, { useState } from 'react';
import styles from "./ChatItem.module.scss";
import userIcon from "../../../../assets/user.svg";
import sentIcon from "../../../../assets/checkmark.svg";
import delivered from "../../../../assets/delivered.svg";
import seen from "../../../../assets/seen.svg";
import { setCurrentChat } from "../../../../store/chatSlice";

import { MESSAGE_STATUS } from "../../../../Helpers/Constants";
import { useSelector, useDispatch } from 'react-redux';


/**
 * ChatItem component is a re-usable component for chat items in the chat sidebar.
 * @param {string} email - Contact email
 * @param {string} lastMessage - The most recent message in the chat item.
 * @param {number} numberOfUnreadMessages - The number of unread messages in the chat item.
 * @param {boolean} showUser - Whether to show the user profile picture or not.
 */
function ChatItem(props) {
  const dispatch = useDispatch();
  const [showUser, setShowUser] = useState(false); // ??
  let currentChat = useSelector((state) => state.chat.currentChat.contact.email);
  let containerStyle = styles.chatItemContainer + " " + (currentChat === props.email ? styles.currentChat : " ");

  const handleChatItemOnClick = () => {
    let currentChat = {
      chatId: props.chat.id,
      lastSeen: "",
      contact: {
        profilePic: "",
        email: props.email,
        uid: props.contactUID,
      },
      messages: props.chat.messages,
    };
    console.log(currentChat);

    dispatch(setCurrentChat(currentChat));
  };

  const getUnreadMessagesCount = (arr) => {
    for (let i = arr.length - 1; i >= 0; i--) {
      if (arr[i].status === MESSAGE_STATUS.SEEN) {
        return arr.length - i;
      }
    }
    return 0;
  };

  const convertTimestamp = (timestamp) => {
    var ts = new Date(timestamp);
    return (ts.Date === new Date().Date && ts.Month !== new Date().Date) ? ts.toTimeString().slice(0, 5) : ts.toLocaleString("de").slice(0, -10);
  };

  return (
    <div className={ containerStyle } onClick={ handleChatItemOnClick } >
      <div className={ !showUser ? styles.contactPic : styles.contactPicBG }>
        <img className={ styles.contactPicImg } src={ showUser ? "" : userIcon } alt="Profile" />

      </div>
      <div className={ styles.chatInfo }>
        <div className={ styles.chatItemProfile }>
          <div className={ styles.chatTitle } >
            <div>
              { props.email }
            </div>
            <div className={ styles.statusAndTime }>
              <div className={ styles.icons }>
                { props.deliveryStatus === MESSAGE_STATUS.SENT && (
                  <img className={ "" } src={ sentIcon } alt="Delivery Status: Sent" />
                ) }

                { props.deliveryStatus === MESSAGE_STATUS.DELIVERED && (
                  <img className={ "" } src={ delivered } alt="Delivery Status: Delivered" />
                ) }

                { props.deliveryStatus === MESSAGE_STATUS.SEEN && (
                  <img className={ "" } src={ seen } alt="Delivery Status: Seen" />
                ) }

              </div>
              <div>
                { convertTimestamp(props.timestamp) }
              </div>
            </div>
          </div>

        </div>
        <div className={ styles.chatItemMostRecentMessageSeen }>
          <div>
            { props.chat.messages.at(-1).content }
          </div>
          <div className={ styles.chatItemNumberOfUnreadMessages }>
            <div>
              { getUnreadMessagesCount(props.chat.messages) }
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}

export default ChatItem;