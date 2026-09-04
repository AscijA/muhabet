import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import styles from "./ChatContent.module.scss";
import { setCurrentChat } from "../../../store/chatSlice";
import { MESSAGE_STATUS } from "../../../Helpers/Constants";
import { RootState, AppDispatch } from 'src/store/store';
import { Message } from 'src/types';
import MessageItem from '../MessageItem/MessageItem';
import MessageInput from './MessageInput';

const initialMessage: Partial<Message> = {
  content: "",
  contentType: "text",
  messageID: "",
  messageStatus: "",
  ownerID: "",
  timestamp: "",
};

const ChatContent: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const chatContentRef = useRef<HTMLDivElement>(null);

  const currentUser = useSelector((state: RootState) => state.user);
  const chatState = useSelector((state: RootState) => state.chat);
  const allChats = useSelector((state: RootState) => state.chat.allChats);
  const currentChatMeta = chatState.currentChat;

  const currentChatFull = useMemo(
    () => allChats.find(c => c.id === currentChatMeta.chatId),
    [allChats, currentChatMeta.chatId]
  );

  const currentMessages = useMemo(() => currentChatFull?.messages || [], [currentChatFull?.messages]);

  const [message, setMessage] = useState<Partial<Message>>(initialMessage);
  const [buttonAction, setButtonAction] = useState("Send");
  const [replyEditId, setReplyEditId] = useState<string | null>(null);

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

  const seenQueueRef = useRef<Set<string>>(new Set());
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
          updateMessageInSubcollection(cf.id, messageID, { messageStatus: MESSAGE_STATUS.SEEN as import('src/types').MessageStatus })
            .catch(err => console.error("Error marking messages as seen:", err));
        }
      });
    });
  }, []);

  const onVisibleSeen = useCallback((messageID: string) => {
    seenQueueRef.current.add(messageID);
    if (!rafRef.current) {
      rafRef.current = requestAnimationFrame(flushSeenQueue);
    }
  }, [flushSeenQueue]);

  const handleChangeMessage = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage((state) => ({
      ...state,
      content: event.target.value,
    }));
  };

  const handleEnter = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter") {
      event.preventDefault();
      handleSendMessage();
    }
  };

  const handleSendMessage = () => {
    if (!message.content?.trim()) return;

    const newMessage: Message = {
      ...(message as Message),
      ownerID: currentUser.uid,
      messageStatus: MESSAGE_STATUS.SENT as import('src/types').MessageStatus,
      timestamp: new Date().toISOString(),
      messageID: `${Date.now()}_${currentUser.uid}`,
      replyTo: replyEditId || undefined,
    };

    setMessage(initialMessage);

    import('src/Helpers/ChatUtils').then(({ addMessageToSubcollection }) => {
      addMessageToSubcollection(currentChatMeta.chatId, newMessage)
        .catch((err) => { console.error("Error updating messages:", err); alert("Failed to update message. Check your connection."); });
    });
  };

  const handleEditMessage = () => {
    if (!message.content?.trim()) return;

    const newMessage = { ...message };
    setMessage(initialMessage);

    import('src/Helpers/ChatUtils').then(({ updateMessageInSubcollection }) => {
      if (newMessage.messageID) {
        updateMessageInSubcollection(currentChatMeta.chatId, newMessage.messageID, newMessage)
          .catch((err) => { console.error("Error updating messages:", err); alert("Failed to update message. Check your connection."); });
      }
    });
    setButtonAction("Send");
  };

  const handleDeleteMessage = (messageID: string) => {
    if (!messageID) return;

    import('src/Helpers/ChatUtils').then(({ updateMessageInSubcollection }) => {
      updateMessageInSubcollection(currentChatMeta.chatId, messageID, { content: "" })
        .catch((err) => { console.error("Error updating messages:", err); alert("Failed to update message. Check your connection."); });
    });
  };

  const handleReplyMessage = () => {
    if (!message.content?.trim() || !replyEditId) return;
    cancelReply();
    handleSendMessage();
  };

  const cancelReply = () => {
    setReplyEditId(null);
    setButtonAction("Send");
    if (message.messageID) { setMessage(initialMessage); }
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
        updateMessageInSubcollection(currentChatMeta.chatId, m.messageID, { messageStatus: MESSAGE_STATUS.SEEN as import('src/types').MessageStatus })
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
            deliveryStatus={ m.messageStatus || "" }
            rootEl={ chatContentRef.current }
            onVisibleSeen={ onVisibleSeen }
            setMessage={ (msg) => setMessage({ content: msg.content, messageID: msg.messageID }) }
            setButtonAction={ setButtonAction }
            handleDeleteMessage={ handleDeleteMessage }
            setReplyEdit={ setReplyEditId }
            replyTo={ m.replyTo && currentChatFull ?
              {
                content: (currentChatFull.messages.find(msg => msg.messageID === m.replyTo)?.content || "*This message was deleted*"),
                replyOwner: (currentChatFull.messages.find(msg => msg.messageID === m.replyTo)?.ownerID === currentUser.uid ? "You: " : "Friend: ")
              }
              : null }
          />
        )) }
      </div>
      <div className={ styles.messageBoxContainer }>
        <MessageInput
          currentChatFull={ currentChatFull }
          currentUser={ currentUser }
          chatState={ chatState }
          dispatch={ dispatch }
          message={ message }
          handleChangeMessage={ handleChangeMessage }
          handleEnter={ handleEnter }
          buttonAction={ buttonAction }
          handleSendMessage={ handleSendMessage }
          handleEditMessage={ handleEditMessage }
          handleReplyMessage={ handleReplyMessage }
          replyEditId={ replyEditId }
          cancelReply={ cancelReply }
          currentMessages={ currentMessages }
        />
      </div>
    </div>
  );
};

export default ChatContent;
