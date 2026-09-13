import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import styles from "./ChatContent.module.scss";
import { addOptimisticMessage, markMessageFailed, markMessagePending, selectChatById, selectCurrentChat } from "../../../store/chatSlice";
import { MESSAGE_STATUS } from "../../../Helpers/Constants";
import { RootState, AppDispatch } from 'src/store/store';
import { Chat, Message } from 'src/types';
import MessageItem from '../MessageItem/MessageItem';
import MessageInput from './MessageInput';
import { messageUseCases } from 'src/app/chatServices';

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
  const currentChatMeta = useSelector(selectCurrentChat);
  const selectedConversation = useSelector((state: RootState) => selectChatById(state, currentChatMeta.chatId));
  const currentChatFull = useMemo<Chat | undefined>(() => {
    if (selectedConversation) return selectedConversation;
    if (!currentChatMeta.chatId || !currentChatMeta.contact.uid) return undefined;
    return {
      id: currentChatMeta.chatId,
      chatId: currentChatMeta.chatId,
      participantIDs: [currentUser.uid, currentChatMeta.contact.uid],
      participants: [
        { userID: currentUser.uid, email: currentUser.email, blockStatus: false, deleteStatus: false },
        { userID: currentChatMeta.contact.uid, email: currentChatMeta.contact.email, blockStatus: false, deleteStatus: false },
      ],
      messages: currentChatMeta.messages,
      lastModified: "",
    };
  }, [currentChatMeta, currentUser.email, currentUser.uid, selectedConversation]);

  const currentMessages = useMemo(() => currentChatFull?.messages || [], [currentChatFull?.messages]);

  const [message, setMessage] = useState<Partial<Message>>(initialMessage);
  const [replyToId, setReplyToId] = useState<string | null>(null);
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const buttonAction = editingMessageId ? "Edit" : replyToId ? "Reply" : "Send";
  const [operationError, setOperationError] = useState("");

  const messagesRef = useRef(currentMessages);
  const chatFullRef = useRef(currentChatFull);
  const userRef = useRef(currentUser);

  useEffect(() => { messagesRef.current = currentMessages; }, [currentMessages]);
  useEffect(() => { chatFullRef.current = currentChatFull; }, [currentChatFull]);
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

    ids.forEach(messageID => {
      const m = msgs.find(msg => msg.messageID === messageID);
      if (m && m.ownerID !== userRef.current.uid) {
        messageUseCases.advanceStatus(cf.id, m, MESSAGE_STATUS.SEEN)
          .catch(error => console.error("Error marking message as seen:", error));
      }
    });
  }, []);

  const onVisibleSeen = useCallback((messageID: string) => {
    seenQueueRef.current.add(messageID);
    if (!rafRef.current) {
      rafRef.current = requestAnimationFrame(flushSeenQueue);
    }
  }, [flushSeenQueue]);

  const handleChangeMessage = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setOperationError("");
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

    const outgoing = messageUseCases.create(currentUser.uid, message.content, replyToId || undefined);
    setMessage(initialMessage);
    dispatch(addOptimisticMessage({ conversationId: currentChatMeta.chatId, message: outgoing }));
    messageUseCases.send(currentChatMeta.chatId, outgoing)
        .catch((err) => {
          dispatch(markMessageFailed({ conversationId: currentChatMeta.chatId, messageId: outgoing.messageID }));
          console.error("Error sending message:", err);
          setOperationError("Message could not be sent. Check your connection and try again.");
        });
  };

  const handleEditMessage = () => {
    if (!message.content?.trim()) return;

    const newMessage = { ...message };
    setMessage(initialMessage);

    if (newMessage.messageID) {
        messageUseCases.edit(currentChatMeta.chatId, newMessage.messageID, newMessage.content || "")
          .catch((err) => {
            console.error("Error editing message:", err);
            setOperationError("Message could not be edited. Check your connection and try again.");
          });
    }
    setEditingMessageId(null);
  };

  const handleDeleteMessage = (messageID: string) => {
    if (!messageID) return;

    messageUseCases.remove(currentChatMeta.chatId, messageID)
        .catch((err) => {
          console.error("Error deleting message:", err);
          setOperationError("Message could not be deleted. Check your connection and try again.");
        });
  };

  const retryMessage = (outgoing: Message) => {
    dispatch(markMessagePending({ conversationId: currentChatMeta.chatId, messageId: outgoing.messageID }));
    messageUseCases.send(currentChatMeta.chatId, outgoing).catch(() => {
      dispatch(markMessageFailed({ conversationId: currentChatMeta.chatId, messageId: outgoing.messageID }));
    });
  };

  const handleReplyMessage = () => {
    if (!message.content?.trim() || !replyToId) return;
    cancelReply();
    handleSendMessage();
  };

  const cancelReply = () => {
    setReplyToId(null);
    setEditingMessageId(null);
    if (message.messageID) setMessage(initialMessage);
  };

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
            clientState={ m.clientState }
            onRetry={ () => retryMessage(m) }
            rootEl={ chatContentRef.current }
            onVisibleSeen={ onVisibleSeen }
            onEdit={ msg => { setMessage(msg); setEditingMessageId(msg.messageID); setReplyToId(null); } }
            handleDeleteMessage={ handleDeleteMessage }
            onReply={ id => { setReplyToId(id); setEditingMessageId(null); setMessage(initialMessage); } }
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
        { operationError && <div className={ styles.operationError } role="alert">{ operationError }</div> }
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
          replyEditId={ editingMessageId || replyToId }
          cancelReply={ cancelReply }
          currentMessages={ currentMessages }
        />
      </div>
    </div>
  );
};

export default ChatContent;
