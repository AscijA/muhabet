import React, {useState} from 'react';
import styles from "./ChatContent.module.scss";
import {useSelector} from 'react-redux';
// import BasicModal from '../../Common/BasicModal/BasicModal';
import {useDispatch} from 'react-redux';
import CustomButton from '../../Common/Buttons/CustomButton';
import {addMessageToCurrentChat} from "../../../store/chatSlice";
import {MESSAGE_STATUS} from "../../../Helpers/Constants";

const initialMessage = {
    "messageText": "",
    "sender": "",
    "timestamp": "",
    "status": "",
};

function ChatContent() {
    const dispatch = useDispatch();
    let chat = useSelector((state) => state.chat);
    let currentUser = useSelector((state) => state.user);
    const allChats = useSelector((state) => state.chat)
    const [message, setMessage] = useState(initialMessage);

    let handleChangeMessage = (event) => {
        setMessage(state => {
                return {
                    ...state,
                    messageText: event.target.value,
                }
            }
        );
    }

    const handleEnter = event => {
        if (event.key === "Enter") {
            event.preventDefault();
            handleSendMessage()
        }
    };
    const handleSendMessage = () => {
        if (message.messageText !== "") {
            // To be added
            // v
            // dispatch(sendMessage(messageText));
            // update firebase with message
            // send message to the subscriber
            // console.log("preupdate");
            setMessage((oldState) => {
                    let newMessage = {
                        ...oldState,
                        sender: currentUser.uid,
                        status: MESSAGE_STATUS.MESSAGE_SENT,
                        timestamp: Date.now(),
                    }
                    dispatch(addMessageToCurrentChat(newMessage));
                    return newMessage;

                }
            );
            // console.log(message)
            // dispatch(addMessageToCurrentChat(message))
            // setMessage(initialMessage);
        }
    };
    return (
        // Chat window content with message box and message input, no header
        <div className={styles.mainChatContainer}>
            <div className={styles.chatContent}>

                
            </div>
            <div className={styles.messageBoxContainer}>
                <div className={styles.inputContainer}>
                    <textarea placeholder="Type a message" value={message.messageText} onChange={handleChangeMessage}
                              onKeyDown={handleEnter}/>
                </div>
                <div className={styles.buttonContainer}>
                    <CustomButton buttonText="Send" buttonSize="sm" buttonType="filled"
                                  handleSubmit={handleSendMessage}/>
                </div>

            </div>
        </div>
    );
}

export default ChatContent;