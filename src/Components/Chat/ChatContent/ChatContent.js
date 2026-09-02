import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';

import styles from "./ChatContent.module.scss";

import { setCurrentChat } from "../../../store/chatSlice";
import { MESSAGE_STATUS } from "../../../Helpers/Constants";
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

  const currentMessages = useMemo(() => currentChatFull?.messages || [], [currentChatFull?.messages]);

  const [message, setMessage] = useState(initialMessage);
  const [buttonAction, setButtonAction] = useState("Send");
  const [replyEditId, setReplyEditId] = useState(null);

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

    const cf = chatFullRef.current;
    const msgs = messagesRef.current;
    if (!cf || !msgs) return;

    import('src/Helpers/ChatUtils').then(({ updateMessageInSubcollection }) => {
      ids.forEach(messageID => {
        const m = msgs.find(msg => msg.messageID === messageID);
        if (m && m.ownerID !== userRef.current.uid && m.messageStatus !== MESSAGE_STATUS.SEEN) {
          updateMessageInSubcollection(cf.id, messageID, { messageStatus: MESSAGE_STATUS.SEEN })
            .catch(err => console.error("Error marking messages as seen:", err));
        }
      });
    });
  }, []);

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
      replyTo: replyEditId || null,
    };

    setMessage(initialMessage);

    import('src/Helpers/ChatUtils').then(({ addMessageToSubcollection }) => {
      addMessageToSubcollection(currentChatMeta.chatId, newMessage)
        .catch((err) => { console.error("Error updating messages:", err); alert("Failed to update message. Check your connection."); });
    });
  };

  const handleEditMessage = () => {
    if (!message.content.trim()) return;

    const newMessage = { ...message };
    setMessage(initialMessage);

    import('src/Helpers/ChatUtils').then(({ updateMessageInSubcollection }) => {
      updateMessageInSubcollection(currentChatMeta.chatId, newMessage.messageID, newMessage)
        .catch((err) => { console.error("Error updating messages:", err); alert("Failed to update message. Check your connection."); });
    });
    setButtonAction("Send");
  };

  const handleDeleteMessage = (messageID) => {
    if (!messageID) return;

    import('src/Helpers/ChatUtils').then(({ updateMessageInSubcollection }) => {
      updateMessageInSubcollection(currentChatMeta.chatId, messageID, { content: "" })
        .catch((err) => { console.error("Error updating messages:", err); alert("Failed to update message. Check your connection."); });
    });
  };

  const handleReplyMessage = (messageID) => {
    if (!message.content.trim() || !messageID) return;
    cancelReply();
    handleSendMessage();
  };

  const cancelReply = () => {
    setReplyEditId(null);
    setButtonAction("Send");
    if (message.messageID) { setMessage(initialMessage); }
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

    let replyEditContent = null;
    if (replyEditId) {
      replyEditContent = currentMessages.find(m => m.messageID === replyEditId)?.content || "*This message was deleted*";
      if (replyEditContent.length > 100) { replyEditContent = replyEditContent.substring(0, 100) + "..."; }
    }

    return (
      <>
        <div className={ styles.inputContainer }>
          { replyEditId && (
            <div className={ styles.replyInfo }>
              <span>{ replyEditContent }</span>
              <span className={ styles.cancelReply } onClick={ cancelReply }>
                &times;
              </span>
            </div>
          ) }
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
            handleSubmit={ buttonAction === "Send" ? handleSendMessage
              : buttonAction === "Edit" ? handleEditMessage
                : handleReplyMessage }
          />
        </div>
      </>
    );
  };

  useEffect(() => {
    if (!currentChatFull) return;

    const msgs = currentChatFull.messages || [];
    const incomingUnseen = msgs.filter(
      m => m.ownerID !== currentUser.uid && m.messageStatus !== MESSAGE_STATUS.SEEN
    );
    
    if (incomingUnseen.length === 0) return;

    import('src/Helpers/ChatUtils').then(({ updateMessageInSubcollection }) => {
      incomingUnseen.forEach(m => {
        updateMessageInSubcollection(currentChatMeta.chatId, m.messageID, { messageStatus: MESSAGE_STATUS.SEEN })
          .catch(err => console.error("Error marking messages as seen:", err));
      });
    });
  }, [currentChatFull, currentUser.uid, currentChatMeta.chatId]);

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
            setReplyEdit={ setReplyEditId }
            replyTo={ m.replyTo ?
              {
                content: (currentChatFull.messages.find(msg => msg.messageID === m.replyTo)?.content || "*This message was deleted*"),
                replyOwner: (currentChatFull.messages.find(msg => msg.messageID === m.replyTo)?.ownerID === currentUser.uid ? "You: " : "Friend: ")
              }
              : null }
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
