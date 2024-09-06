import React, { useEffect, useRef, useState } from 'react';
import styles from "./MessageItem.module.scss";

// Single Message Component for both own and other messages
const MessageItem = ({ text, timestamp, isOwnMessage }) => {

  const [showMessageMenu, setShowMessageMenu] = useState(false);
  const menuRef = useRef(null);
  const messageType = `${styles.message} ${isOwnMessage ? styles.ownMessage : styles.otherMessage}`;


  const toggleMenu = (event) => {
    event.preventDefault();
    setShowMessageMenu((prev) => !prev);
  };

  const closeMenu = (event) => {
    if (menuRef.current && !menuRef.current.contains(event.target)) {
      setShowMessageMenu(false);
    }
  };

  useEffect(() => {
    if (showMessageMenu) {
      document.addEventListener("click", closeMenu);
    } else {
      document.removeEventListener("click", closeMenu);
    }

    return () => {
      document.removeEventListener("click", closeMenu);
    };
  }, [showMessageMenu]);

  return (
    <div className={ messageType } onContextMenu={ toggleMenu }>
      <div>
        <div className={ styles.messageContent }>{ text }</div>
        <div className={ styles.messageTimestamp }>{ timestamp }</div>
      </div>
      <div className={ styles.dotMenu } onClick={ toggleMenu } >
        &#8942;
      </div>
      { showMessageMenu && (
        <div ref={ menuRef } className={ styles.customMenu }>
          <div className={ styles.menuItem }>Edit</div>
          <div className={ styles.menuItem }>Delete</div>
        </div>
      ) }
    </div>

  );
};


export default MessageItem;