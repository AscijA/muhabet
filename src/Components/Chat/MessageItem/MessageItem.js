import React from 'react';
import styles from "./MessageItem.module.scss";

// Single Message Component for both own and other messages
const MessageItem = ({ text, timestamp, isOwnMessage }) => {
  return (
    <div className={ `${styles.message} ${isOwnMessage ? styles.ownMessage : styles.otherMessage}` }>
      <div className={ styles.messageContent }>{ text }</div>
      <div className={ styles.messageTimestamp }>{ timestamp }</div>
    </div>
  );
};


export default MessageItem;