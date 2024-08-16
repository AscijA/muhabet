import React from 'react';
import styles from "./ChatContent.module.scss";
import { useSelector } from 'react-redux';
// import BasicModal from '../../Common/BasicModal/BasicModal';
import { useDispatch } from 'react-redux';
import CustomButton from '../../Common/Buttons/CustomButton';

function ChatContent() {
  return (
    // Chat window content with message box and message input, no header
    <div className={ styles.mainChatContainer }>
      <div className={ styles.chatContent }>
      </div>
      <div className={ styles.messageBoxContainer }>
        <div className={ styles.inputContainer }>
          <textarea placeholder="Type a message" />
        </div>
        <div className={ styles.buttonContainer }>
          <CustomButton buttonText="Send" buttonSize="sm" buttonType="filled" />
        </div>

      </div>
    </div>
  );
}

export default ChatContent;