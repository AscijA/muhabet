import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';

import styles from "./ChatContent.module.scss";

import { setCurrentChat, updateChatByID } from "../../../store/chatSlice";
import { MESSAGE_STATUS } from "../../../Helpers/Constants";
import { updateChat, updateChatNoModify } from 'src/Helpers/ChatUtils';
import { handleChatStatus } from 'src/Helpers/ChatUtils';

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

  const currentMessages = currentChatFull?.messages ;

  const [message, setMessage] = useState(initialMessage);
  const [buttonAction, setButtonAction] = useState("Send");

  useEffect(() => {
    if (!currentChatFull) return;
    if (currentChatMeta?.chatId === currentChatFull.id &&
      currentChatMeta?.messages !== currentChatFull.messages) {
      dispatch(setCurrentChat({ ...currentChatMeta, messages: currentChatFull.messages }));
    }
  }, [
    currentChatFull,
    currentChatMeta,
    dispatch
  ]);

  const messagesRef = useRef(currentMessages);
  const chatFullRef = useRef(currentChatFull);
  const chatMetaRef = useRef(currentChatMeta);
  const userRef = useRef(currentUser);

  useEffect(() => { messagesRef.current = currentMessages; }, [currentMessages]);
  useEffect(() => { chatFullRef.current = currentChatFull; }, [currentChatFull]);
  useEffect(() => { chatMetaRef.current = currentChatMeta; }, [currentChatMeta]);
  useEffect(() => { userRef.current = currentUser; }, [currentUser]);

  const seenQueueRef = useRef(new Set());
  const rafRef = useRef(0);

  const flushSeenQueue = useCallback(() => {
    rafRef.current = 0;
    const ids = Array.from(seenQueueRef.current);
    seenQueueRef.current.clear();
    if (ids.length === 0) return;

    const msgs = messagesRef.current;
    const updated = msgs.map(m =>
      (ids.includes(m.messageID) &&
        m.ownerID !== userRef.current.uid &&
        m.messageStatus !== MESSAGE_STATUS.SEEN )
        ? { ...m, messageStatus: MESSAGE_STATUS.SEEN }
        : m
    );

    let changed = false;
    for (let i = 0; i < msgs.length; i++) { if (msgs[i] !== updated[i]) { changed = true; break; } }
    if (!changed) return;

    const cf = chatFullRef.current;
    const cm = chatMetaRef.current;
    if (!cf) return;

    const newChat = { ...cf, messages: updated };
    dispatch(updateChatByID(newChat));
    dispatch(setCurrentChat({ ...cm, messages: updated }));

    updateChat("messages", updated, cm.chatId)
      .catch(err => console.error("Error marking messages as seen:", err));
  }, [dispatch]);

  const onVisibleSeen = useCallback((messageID) => {
    seenQueueRef.current.add(messageID);
    if (!rafRef.current) {
      rafRef.current = requestAnimationFrame(flushSeenQueue);
    }
  }, [flushSeenQueue]);

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
      dispatch(setCurrentChat({ ...currentChatMeta, messages: updatedChat.messages }));
    }

    updateChat("messages", [...currentMessages, newMessage], currentChatMeta.chatId)
      .catch((err) => console.error("Error updating messages:", err));
  };

  const handleEditMessage = () => {
    if (!message.content.trim()) return;

    const newMessage = { ...message };
    setMessage(initialMessage);

    const updated = currentMessages.map(msg =>
      msg.messageID === newMessage.messageID ? { ...msg, ...newMessage } : msg
    );

    if (currentChatFull) {
      dispatch(updateChatByID({ ...currentChatFull, messages: updated }));
      dispatch(setCurrentChat({ ...currentChatMeta, messages: updated }));
      updateChatNoModify("messages", updated, currentChatMeta.chatId)
        .catch((err) => console.error("Error updating messages:", err));
    }
    setButtonAction("Send");
  };

  const handleDeleteMessage = (messageID) => {
    if (!messageID) return;

    const updated = currentMessages.map(msg =>
      msg.messageID === messageID ? { ...msg, content: "" } : msg
    );

    if (currentChatFull) {
      dispatch(updateChatByID({ ...currentChatFull, messages: updated }));
      dispatch(setCurrentChat({ ...currentChatMeta, messages: updated }));
      updateChatNoModify("messages", updated, currentChatMeta.chatId)
        .catch((err) => console.error("Error updating messages:", err));
    }
  };

  const renderMessageBox = () => {
    if (!currentChatFull) return null;

    const me = currentChatFull.participants?.find(p => p.userID === currentUser.uid);
    const other = currentChatFull.participants?.find(p => p.userID !== currentUser.uid);

    const ownBlock = (
      <>
        <div className={ `${styles.inputContainer} ${styles.ownBlock}` }>
          <div>You have blocked this user. To send a message, please Unblock them.</div>
        </div>
        <div className={ styles.buttonContainer }>
          <CustomButton
            buttonText="Unblock"
            buttonSize="sm"
            buttonType="filled"
            handleSubmit={ () => { handleChatStatus("block", chatState, currentUser, dispatch); } }
          />
        </div>
      </>
    );

    const otherBlock = (
      <div className={ `${styles.inputContainer} ${styles.otherBlock}` }>
        <div>You have been blocked by this user. You cannot send any messages.</div>
      </div>
    );

    if (me?.blockStatus) return ownBlock;
    if (other?.blockStatus) return otherBlock;

    return (
      <>
        <div className={ styles.inputContainer }>
          <textarea
            placeholder="Type a message"
            value={ message.content }
            onChange={ handleChangeMessage }
            onKeyDown={ handleEnter }
          />
        </div>
        <div className={ styles.buttonContainer }>
          <CustomButton
            buttonText={ buttonAction }
            buttonSize="sm"
            buttonType=""
            handleSubmit={ buttonAction === "Send" ? handleSendMessage : handleEditMessage }
          />
        </div>
      </>
    );
  };

  useEffect(() => {
    if (!currentChatFull) return;

    const msgs = currentChatFull.messages || [];
    const incomingUnseen = msgs.some(
      m => m.ownerID !== currentUser.uid && m.messageStatus !== MESSAGE_STATUS.SEEN
    );
    if (!incomingUnseen) return;

    const updated = msgs.map(m =>
      (m.ownerID !== currentUser.uid && m.messageStatus !== MESSAGE_STATUS.SEEN)
        ? { ...m, messageStatus: MESSAGE_STATUS.SEEN }
        : m
    );

    let changed = false;
    for (let i = 0; i < msgs.length; i++) if (msgs[i] !== updated[i]) { changed = true; break; }
    if (!changed) return;

    const newChat = { ...currentChatFull, messages: updated };
    dispatch(updateChatByID(newChat));
    dispatch(setCurrentChat({ ...currentChatMeta, messages: updated }));
    updateChat("messages", updated, currentChatMeta.chatId)
      .catch(err => console.error("Error marking messages as seen:", err));
  }, [currentChatFull, currentUser.uid, currentChatMeta, dispatch]);

  useEffect(() => {
    const el = chatContentRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [currentMessages.length]);

  return (
    <div className={ styles.mainChatContainer }>
      <div className={ styles.chatContent } ref={ chatContentRef }>
        { currentMessages.map((m) => (
          <MessageItem
            key={ m.messageID }
            messageID={ m.messageID }
            text={ m.content }
            timestampMs={ m.timestamp }
            isOwnMessage={ m.ownerID === currentUser.uid }
            deliveryStatus={ m.messageStatus }
            rootEl={ chatContentRef.current }
            onVisibleSeen={ onVisibleSeen }
            setMessage={ setMessage }
            setButtonAction={ setButtonAction }
            handleDeleteMessage={ handleDeleteMessage }
          />
        )) }
      </div>
      <div className={ styles.messageBoxContainer }>
        { renderMessageBox() }
      </div>
    </div>
  );
};

export default ChatContent;
