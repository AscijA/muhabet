import React, { useState, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';

import styles from "./ChatContent.module.scss";

import { addMessageToCurrentChat } from "../../../store/chatSlice";
import { MESSAGE_STATUS } from "../../../Helpers/Constants";
import { handleChatStatus, updateChat } from "src/Helpers/UserUtils";

import CustomButton from '../../Common/Buttons/CustomButton';
import MessageItem from '../MessageItem/MessageItem';

const initialMessage = {
    "content": "",
    "contentType": "text",
    "messageID": "",
    "messageStatus": "",
    "ownerID": "",
    "timestamp": "",
};

const ChatContent = () => {
    const dispatch = useDispatch();
    const chatContentRef = useRef(null);

    let currentUser = useSelector((state) => state.user);
    const chat = useSelector((state) => state.chat);
    const allChats = useSelector((state) => state.chat.allChats);
    const currentMessages = useSelector((state) => state.chat.currentChat.messages);

    const [message, setMessage] = useState(initialMessage);
    const [buttonAction, setButtonAction] = useState("Send");

    const currentChat = chat.currentChat;

    let handleChangeMessage = (event) => {
        setMessage(state => ({
            ...state,
            content: event.target.value,
        }));
    };

    const handleEnter = event => {
        if (event.key === "Enter") {
            event.preventDefault();
            handleSendMessage();
        }
    };

    const handleSendMessage = () => {
        if (message.messageText !== "") {
            let newMessage = {
                ...message,
                ownerID: currentUser.uid,
                messageStatus: MESSAGE_STATUS.SENT,
                timestamp: Date.now(),
                messageID: `${currentMessages.length}`,
            };
            setMessage(initialMessage);

            // used to prevent the message from being sent immediately
            setTimeout(() => {
                dispatch(addMessageToCurrentChat(newMessage));
                updateChat("messages", [...currentMessages, newMessage], currentChat.chatId);
            }, 0);
        }
    };

    const handleEditMessage = () => {
        if (message.messageText !== "") {
            let newMessage = { ...message };
            setMessage(initialMessage);

            setTimeout(() => {
                dispatch(addMessageToCurrentChat(newMessage));
                setButtonAction("Send");
            }, 0);
        }
    };

    const returnMessageBox = () => {
        let ownBlock = (
            <>
                <div className={ `${styles.inputContainer} ${styles.ownBlock}` }>
                    <div>You have blocked this user. To send a message, please Unblock them.</div>
                </div>
                <div className={ styles.buttonContainer }>
                    <CustomButton
                        buttonText="Unblock"
                        buttonSize="sm"
                        buttonType="filled"
                        handleSubmit={ () => { handleChatStatus("block", chat, currentUser, dispatch); } }
                    />
                </div>
            </>
        );

        let otherBlock = (
            <div className={ `${styles.inputContainer} ${styles.otherBlock}` }>
                <div>You have been blocked by this user. You cannot send any messages.</div>
            </div>
        );
        let currentChatFull = allChats.find(chat => chat.id === currentChat.chatId);
        if (currentUser.uid === currentChatFull.user1ID && currentChat.chatStatus.user1Block) {
            return ownBlock;
        }
        else if (currentUser.uid === currentChatFull.user1ID && currentChat.chatStatus.user2Block) {
            return otherBlock;
        }
        else if (currentUser.uid === currentChatFull.user2ID && currentChat.chatStatus.user2Block) {
            return ownBlock;
        }
        else if (currentUser.uid === currentChatFull.user2ID && currentChat.chatStatus.user1Block) {
            return otherBlock;
        }

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

    // Scroll to the bottom of chatContent whenever currentMessages change
    useEffect(() => {
        if (chatContentRef.current) {
            chatContentRef.current.scrollTop = chatContentRef.current.scrollHeight;
        }
    }, [currentMessages]);
    return (
        <div className={ styles.mainChatContainer }>
            <div className={ styles.chatContent }>
                { currentMessages.map((message) => {
                    return <MessageItem
                        key={ message.messageID }
                        text={ message.content }
                        timestamp={ new Date(message.timestamp) }
                        isOwnMessage={ message.ownerID === currentUser.uid }
                        deliveryStatus={ message.messageStatus } />;
                }) }
            </div>
            <div className={ styles.messageBoxContainer }>
                { returnMessageBox() }
            </div>
        </div>
    );
};

export default ChatContent;
