import React, { useEffect, useState } from 'react';
import styles from "./ChatItem.module.scss";

import { useSelector, useDispatch } from 'react-redux';

import userIcon from "../../../../assets/user.svg";
import sentIcon from "../../../../assets/checkmark.svg";
import delivered from "../../../../assets/delivered.svg";
import seen from "../../../../assets/seen.svg";

import { fetchProfilePicture, fetchAndUpdateContactProfile } from "../../../../Helpers/ContactUtils";
import { updateContact, setCurrentChat } from "../../../../store/chatSlice";
import { subscribeToAuthChangesBasic } from "src/Helpers/AuthUtils";
import { MESSAGE_STATUS } from "../../../../Helpers/Constants";


/**
 * Chat item component shown in the side bar of the chat window
 *
 * @param {string} email - Email of the contact
 * @param {string} contactUID - UID of the contact
 * @param {Object} chat - Chat object
 * @param {string} deliveryStatus - Delivery status of the message
 * @param {Date} timestamp - Timestamp of the message
 */
const ChatItem = (props) => {
  const dispatch = useDispatch();

  let currentChat = useSelector((state) => state.chat.currentChat.contact.email);
  let chat = useSelector((state) => state.chat);

  const [showUser, setShowUser] = useState(false);
  const [numberUnread, setNumberUnread] = useState(0);
  const [profilePic, setProfilePic] = useState("");

  let chatStatusDel = props.email === props.chat.user1Email ? props.chat.chatStatus.user2Del : props.chat.chatStatus.user1Del;
  let containerStyle = styles.chatItemContainer + " " + (currentChat === props.email ? styles.currentChat : "");

  // Fetch profile picture of the contact
  useEffect(() => {
    const unsubscribe = subscribeToAuthChangesBasic((user) => {
      if (user && props.contactUID) {
        fetchProfilePicture(props.contactUID, setProfilePic, setShowUser);
        getUnreadMessagesCount(props.chat.messages);
      }
    });

    return () => unsubscribe();
  }, [props.contactUID, dispatch, props.chat.messages]);

  const handleChatItemOnClick = () => {
    let currentChat = {
      chatId: props.chat.id,
      lastSeen: "",
      contact: {
        profilePic: profilePic,
        email: props.email,
        uid: props.contactUID,
      },
      messages: props.chat.messages,
      chatStatus: props.chat.chatStatus
    };

    dispatch(setCurrentChat(currentChat));
  };

  // Update contact profile picture
  useEffect(() => {
    fetchAndUpdateContactProfile(chat.currentChat?.contact?.uid, chat.currentChat?.contact?.profilePic, updateContact, dispatch);
  }, [chat.currentChat.contact.profilePic, chat.currentChat.contact.uid, dispatch]);

  const getUnreadMessagesCount = (arr) => {
    for (let i = arr.length - 1; i >= 0; i--) {
      if (arr[i].status === MESSAGE_STATUS.SEEN) {
        setNumberUnread(arr.length - i);
      }
    }
    setNumberUnread(0);
  };

  const convertTimestamp = (timestamp) => {
    var ts = new Date(timestamp);
    return (ts.Date === new Date().Date && ts.Month !== new Date().Date) ? ts.toTimeString().slice(0, 5) : ts.toLocaleString("de").slice(0, -10);
  };

  return !chatStatusDel && (
    <div className={ containerStyle } onClick={ handleChatItemOnClick } >
      <div className={ showUser ? styles.contactPicBG : styles.contactPic }>
        <img className={ styles.contactPicImg } src={ showUser ? profilePic : userIcon } alt="Profile" />
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
            { numberUnread !== 0 && (<div>
              { numberUnread }
            </div>) }
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatItem;
