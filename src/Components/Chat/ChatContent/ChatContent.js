import React, { useState } from 'react';
import styles from "./ChatContent.module.scss";
import { useSelector } from 'react-redux';
// import BasicModal from '../../Common/BasicModal/BasicModal';
import { useDispatch } from 'react-redux';
import CustomButton from '../../Common/Buttons/CustomButton';
import { addMessageToCurrentChat } from "../../../store/chatSlice";
import { MESSAGE_STATUS } from "../../../Helpers/Constants";
import MessageItem from '../MessageItem/MessageItem';

const initialMessage = {
    "messageText": "",
    "sender": "",
    "timestamp": "",
    "status": "",
};

function ChatContent() {
    const dispatch = useDispatch();
    let currentUser = useSelector((state) => state.user);
    // const currentChat = useSelector((state) => state.chat.currentChat);
    const currentMessages = useSelector((state) => state.chat.currentChat.messages);
    const [message, setMessage] = useState(initialMessage);
    const [buttonAction, setButtonAction] = useState("Send");

    let handleChangeMessage = (event) => {
        setMessage(state => {
            return {
                ...state,
                messageText: event.target.value,
            };
        }
        );
    };

    const handleEnter = event => {
        if (event.key === "Enter") {
            event.preventDefault();
            handleSendMessage();
        }
    };
    const handleSendMessage = () => {
        if (message.messageText !== "") {
            // To be added
            // v
            // dispatch(sendMessage(messageText));
            // update firebase with message
            // send message to the subscriber

            let newMessage = {
                ...message,
                sender: currentUser.uid,
                status: MESSAGE_STATUS.SENT,
                timestamp: Date.now(),
            };
            setMessage(initialMessage);

            setTimeout(() => {
                dispatch(addMessageToCurrentChat(newMessage));
            }, 0);

        }
    };


    const handleEditMessage = () => {
        if (message.messageText !== "") {
            // To be added
            // v
            // dispatch(sendMessage(messageText));
            // update firebase with message
            // send message to the subscriber

            let newMessage = {
                ...message
            };
            setMessage(initialMessage);

            setTimeout(() => {
                dispatch(addMessageToCurrentChat(newMessage));
                setButtonAction("Send");
            }, 0);

        }
    };



    return (
        // Chat window content with message box and message input, no header
        <div className={ styles.mainChatContainer }>
            <div className={ styles.chatContent }>

                { currentMessages.map((message) => {
                    return <MessageItem key={ message.id } text={ message.content } timestamp={new Date( message.timestamp) } isOwnMessage={ message.ownerID === currentUser.uid } deliveryStatus={ message.messageStatus } />;
                }) }

            </div>
            <div className={ styles.messageBoxContainer }>
                <div className={ styles.inputContainer }>
                    <textarea placeholder="Type a message" value={ message.messageText } onChange={ handleChangeMessage }
                        onKeyDown={ handleEnter } />
                </div>
                <div className={ styles.buttonContainer }>
                    <CustomButton buttonText={ buttonAction } buttonSize="sm" buttonType="filled"
                        handleSubmit={ buttonAction === "Send" ? handleSendMessage : handleEditMessage } />
                </div>

            </div>
        </div>
    );
}

export default ChatContent;