import React, { useEffect, useMemo, useState } from 'react';
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
import { RootState, AppDispatch } from 'src/store/store';
import { Chat } from 'src/types';

interface ChatItemProps {
  email: string;
  contactUID: string;
  chat: Chat;
  timestamp: string;
  deliveryStatus: string;
}

const ChatItem: React.FC<ChatItemProps> = (props) => {
  const dispatch = useDispatch<AppDispatch>();

  const chatState = useSelector((state: RootState) => state.chat);
  const currentChatEmail = chatState.currentChat?.contact?.email;
  const containerStyle =
    styles.chatItemContainer + " " + (currentChatEmail === props.email ? styles.currentChat : "");

  const [showUser, setShowUser] = useState(false);
  const [profilePic, setProfilePic] = useState("");

  const other = useMemo(
    () => props.chat.participants?.find(p => p.email !== props.email),
    [props.chat.participants, props.email]
  );
  const chatDeletedByOther = other?.deleteStatus || false;

  const {
    lastMessage,
    lastOutgoingStatus,
    unreadCountIncoming,
    lastTimestamp
  } = useMemo(() => {
    const messages = props.chat.messages || [];
    const contactUID = props.contactUID;

    const last = messages.length ? messages[messages.length - 1] : null;

    let unread = 0;
    for (let i = 0; i < messages.length; i++) {
      const m = messages[i];
      if (m.ownerID === contactUID && m.messageStatus !== MESSAGE_STATUS.SEEN) unread++;
    }

    let lastOutStatus = null;
    if (last && last.ownerID !== contactUID) {
      lastOutStatus = last.messageStatus || null;
    }

    return {
      lastMessage: last,
      lastOutgoingStatus: lastOutStatus,
      unreadCountIncoming: unread,
      lastTimestamp: last?.timestamp ?? null,
    };
  }, [props.chat.messages, props.contactUID]);

  useEffect(() => {
    const unsubscribe = subscribeToAuthChangesBasic((user) => {
      if (user && props.contactUID) {
        fetchProfilePicture(props.contactUID, setProfilePic, setShowUser);
      }
    });
    return () => unsubscribe();
  }, [props.contactUID]);

  useEffect(() => {
    fetchAndUpdateContactProfile(
      chatState.currentChat?.contact?.uid,
      chatState.currentChat?.contact?.profilePic,
      updateContact,
      dispatch
    );
  }, [chatState.currentChat?.contact?.profilePic, chatState.currentChat?.contact?.uid, dispatch]);

  const handleChatItemOnClick = () => {
    const messages = props.chat.messages || [];

    const currentChat = {
      chatId: props.chat.id,
      lastSeen: "",
      contact: {
        profilePic: profilePic,
        email: props.email,
        uid: props.contactUID,
      },
      messages: messages,
    };

    dispatch(setCurrentChat(currentChat));
  };

  const convertTimestamp = (timestamp: string | Date | number | null | undefined) => {
    if (!timestamp) return "";
    const ts = new Date(timestamp);
    if (Number.isNaN(ts.getTime())) return "";
    const now = new Date();
    const isToday =
      ts.getDate() === now.getDate() &&
      ts.getMonth() === now.getMonth() &&
      ts.getFullYear() === now.getFullYear();
    return isToday ? ts.toTimeString().slice(0, 5) : ts.toLocaleDateString("de");
  };

  if (chatDeletedByOther) return null;

  return (
    <div className={ containerStyle } onClick={ handleChatItemOnClick }>
      <div className={ showUser ? styles.contactPicBG : styles.contactPic }>
        <img className={ styles.contactPicImg } src={ showUser ? profilePic : userIcon } alt="Profile" />
      </div>

      <div className={ styles.chatInfo }>
        <div className={ styles.chatItemProfile }>
          <div className={ styles.chatTitle }>
            <div>{ props.email }</div>

            <div className={ styles.statusAndTime }>
              <div className={ styles.icons }>
                { lastOutgoingStatus === MESSAGE_STATUS.SENT && <img src={ sentIcon } alt="Delivery Status: Sent" /> }
                { lastOutgoingStatus === MESSAGE_STATUS.DELIVERED && <img src={ delivered } alt="Delivery Status: Delivered" /> }
                { lastOutgoingStatus === MESSAGE_STATUS.SEEN && <img src={ seen } alt="Delivery Status: Seen" /> }
              </div>
              <div>{ convertTimestamp(lastTimestamp) }</div>
            </div>
          </div>
        </div>

        <div className={ styles.chatItemMostRecentMessageSeen }>
          <div>{ lastMessage?.content && lastMessage?.content !== "*This message was deleted*" ? lastMessage?.content : <em>*This message was deleted*</em> }</div>
          <div className={ styles.chatItemNumberOfUnreadMessages }>
            { unreadCountIncoming > 0 && <div>{ unreadCountIncoming }</div> }
          </div>
        </div>
      </div>
    </div>
  );
};

function areEqual(prev: ChatItemProps, next: ChatItemProps) {
  return (
    prev.email === next.email &&
    prev.contactUID === next.contactUID &&
    prev.chat.id === next.chat.id &&
    prev.chat.messages === next.chat.messages &&
    prev.chat.participants === next.chat.participants
  );
}

export default React.memo(ChatItem, areEqual);
