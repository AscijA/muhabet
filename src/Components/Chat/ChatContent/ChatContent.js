import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';

import styles from "./ChatContent.module.scss";

import { updateChatByID } from "../../../store/chatSlice";
import { MESSAGE_STATUS } from "../../../Helpers/Constants";
import { handleChatStatus, updateChat } from "src/Helpers/UserUtils";

import CustomButton from '../../Common/Buttons/CustomButton';
import MessageItem from '../MessageItem/MessageItem';

const initialMessage = {
  content: "",
  contentType: "text",
  messageID: "",
  messageStatus: "",
  ownerID: "",
  timestamp: "",
};

const ChatContent = () => {
  const dispatch = useDispatch();
  const chatContentRef = useRef(null);

  const currentUser = useSelector((state) => state.user);
  const chatState = useSelector((state) => state.chat);
  const allChats = useSelector((state) => state.chat.allChats);
  const currentChatMeta = chatState.currentChat;

  const currentChatFull = useMemo(
    () => allChats.find(c => c.id === currentChatMeta.chatId),
    [allChats, currentChatMeta.chatId]
  );

  const currentMessages = currentChatFull?.messages || [];

  const [message, setMessage] = useState(initialMessage);
  const [buttonAction, setButtonAction] = useState("Send");

  const handleChangeMessage = (event) => {
    setMessage((state) => ({
      ...state,
      content: event.target.value,
    }));
  };

  const handleEnter = (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      handleSendMessage();
    }
  };

  const handleSendMessage = () => {
    if (!message.content.trim()) return;

    const newMessage = {
      ...message,
      ownerID: currentUser.uid,
      messageStatus: MESSAGE_STATUS.SENT,
      timestamp: Date.now(),
      messageID: `${Date.now()}_${currentUser.uid}`, 
    };

    setMessage(initialMessage);

    if (currentChatFull) {
      const updatedChat = {
        ...currentChatFull,
        messages: [...currentMessages, newMessage],
      };
      dispatch(updateChatByID(updatedChat));
    } 

    updateChat("messages", [...currentMessages, newMessage], currentChatMeta.chatId)
      .catch((err) => console.error("Error updating messages:", err));
  };

  const handleEditMessage = () => {
    if (!message.content.trim()) return;

    const newMessage = { ...message };
    setMessage(initialMessage);

    const updated = [...currentMessages, newMessage];
    if (currentChatFull) {
      dispatch(updateChatByID({ ...currentChatFull, messages: updated }));
    }
    setButtonAction("Send");
  };

  const renderMessageBox = () => {
    if (!currentChatFull) return null;

    const me = currentChatFull.participants?.find(p => p.userID === currentUser.uid);
    const other = currentChatFull.participants?.find(p => p.userID !== currentUser.uid);

    const ownBlock = (
      <>
        <div className={`${styles.inputContainer} ${styles.ownBlock}`}>
          <div>You have blocked this user. To send a message, please Unblock them.</div>
        </div>
        <div className={styles.buttonContainer}>
          <CustomButton
            buttonText="Unblock"
            buttonSize="sm"
            buttonType="filled"
            handleSubmit={() => { handleChatStatus("block", chatState, currentUser, dispatch); }}
          />
        </div>
      </>
    );

    const otherBlock = (
      <div className={`${styles.inputContainer} ${styles.otherBlock}`}>
        <div>You have been blocked by this user. You cannot send any messages.</div>
      </div>
    );

    if (me?.blockStatus) return ownBlock;     // you blocked them
    if (other?.blockStatus) return otherBlock; // they blocked you

    return (
      <>
        <div className={styles.inputContainer}>
          <textarea
            placeholder="Type a message"
            value={message.content}
            onChange={handleChangeMessage}
            onKeyDown={handleEnter}
          />
        </div>
        <div className={styles.buttonContainer}>
          <CustomButton
            buttonText={buttonAction}
            buttonSize="sm"
            buttonType=""
            handleSubmit={buttonAction === "Send" ? handleSendMessage : handleEditMessage}
          />
        </div>
      </>
    );
  };

  // attach the ref to the scrollable element and auto-scroll on message changes
  useEffect(() => {
    if (chatContentRef.current) {
      chatContentRef.current.scrollTop = chatContentRef.current.scrollHeight;
    }
  }, [currentMessages.length]); // scroll when count changes

  return (
    <div className={styles.mainChatContainer}>
      <div className={styles.chatContent} ref={chatContentRef}>
        {currentMessages.map((m) => (
          <MessageItem
            key={m.messageID}
            text={m.content}
            timestamp={new Date(m.timestamp)}
            isOwnMessage={m.ownerID === currentUser.uid}
            deliveryStatus={m.messageStatus}
          />
        ))}
      </div>
      <div className={styles.messageBoxContainer}>
        {renderMessageBox()}
      </div>
    </div>
  );
};

export default ChatContent;
