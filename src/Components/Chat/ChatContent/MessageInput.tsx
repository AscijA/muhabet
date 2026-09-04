import React from 'react';
import styles from "./ChatContent.module.scss";
import CustomButton from '../../Common/Buttons/CustomButton';
import { UserState } from 'src/store/userSlice';
import { ChatState } from 'src/store/chatSlice';
import { AppDispatch } from 'src/store/store';
import { Chat, Message } from 'src/types';
import { handleChatStatus } from 'src/Helpers/ChatUtils';

interface MessageInputProps {
  currentChatFull: Chat | undefined;
  currentUser: UserState;
  chatState: ChatState;
  dispatch: AppDispatch;
  message: Partial<Message>;
  handleChangeMessage: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  handleEnter: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
  buttonAction: string;
  handleSendMessage: () => void;
  handleEditMessage: () => void;
  handleReplyMessage: () => void;
  replyEditId: string | null;
  cancelReply: () => void;
  currentMessages: Message[];
}

const MessageInput: React.FC<MessageInputProps> = ({
  currentChatFull,
  currentUser,
  chatState,
  dispatch,
  message,
  handleChangeMessage,
  handleEnter,
  buttonAction,
  handleSendMessage,
  handleEditMessage,
  handleReplyMessage,
  replyEditId,
  cancelReply,
  currentMessages
}) => {
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

  let replyEditContent: string | null = null;
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
          value={ message.content || "" }
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

export default MessageInput;
