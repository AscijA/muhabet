import React, { useEffect, useRef, useState } from 'react';
import styles from "./MessageItem.module.scss";

import { MESSAGE_STATUS } from 'src/Helpers/Constants';

import sentIcon from "../../../assets/checkmark.svg";
import delivered from "../../../assets/delivered.svg";
import seen from "../../../assets/seen.svg";

/** Message Item containing a single message in the chat window
 * 
 * @param {bool} isOwnMessage - Boolean value to determine if the message is the user's own message or not
 * @param {string} text - The text of the message
 * @param {Date} timestamp - The timestamp of the message
 * @param {string} deliveryStatus - The delivery status of the message
 */
const MessageItem = (props) => {
  const [showMessageMenu, setShowMessageMenu] = useState(false);
  const [renderUpwards, setRenderUpwards] = useState(false); // State to track if menu should render upwards
  const menuRef = useRef(null);
  const messageRef = useRef(null); // Ref for the message container
  const messageType = `${styles.message} ${props.isOwnMessage ? styles.ownMessage : styles.otherMessage}`;

  const toggleMenu = (event) => {
    if (props.isOwnMessage) {
      event.preventDefault();
      setShowMessageMenu((prev) => !prev);
    }
  };

  const closeMenu = (event) => {
    if (menuRef.current && !menuRef.current.contains(event.target) && !messageRef.current.contains(event.target)) {
      setShowMessageMenu(false);
    }
  };

  // handle context menu rendering, needs reworking 
  useEffect(() => {
    if (showMessageMenu) {
      document.addEventListener("click", closeMenu);

      const messageRect = messageRef.current.getBoundingClientRect();
      const menuHeight = 80; // Approximate height of the custom menu (adjust as needed)
      const spaceBelow = window.innerHeight - messageRect.bottom;
      const spaceAbove = messageRect.top;

      // Determine if there's enough space below, otherwise render upwards
      if (spaceBelow < menuHeight && spaceAbove >= menuHeight) {
        setRenderUpwards(true);
      } else {
        setRenderUpwards(false);
      }
    } else {
      document.removeEventListener("click", closeMenu);
    }

    return () => {
      document.removeEventListener("click", closeMenu);
    };
  }, [showMessageMenu]);

  return (
    <div ref={ messageRef } className={ messageType } onContextMenu={ toggleMenu }>
      <div>
        <div className={ styles.messageContent }>{ props.text }</div>
        <div className={ styles.messageTimestamp }>{ (props.timestamp.Date === new Date().Date && props.timestamp.Month !== new Date().Date) ? props.timestamp.toTimeString().slice(0, 5) : props.timestamp.toLocaleString("de").slice(0, -3) }
          { props.isOwnMessage && (<div className={ styles.icons }>
            { props.deliveryStatus === MESSAGE_STATUS.SENT && (
              <img className={ "" } src={ sentIcon } alt="Delivery Status: Sent" />
            ) }

            { props.deliveryStatus === MESSAGE_STATUS.DELIVERED && (
              <img className={ "" } src={ delivered } alt="Delivery Status: Delivered" />
            ) }

            { props.deliveryStatus === MESSAGE_STATUS.SEEN && (
              <img className={ "" } src={ seen } alt="Delivery Status: Seen" />
            ) }
          </div>
          ) }
        </div>
      </div>
      { props.isOwnMessage && (<div className={ styles.dotMenu } onClick={ toggleMenu }>
        &#8942;
      </div>) }
      { showMessageMenu && (
        <div
          ref={ menuRef }
          className={ `${styles.customMenu} ${renderUpwards ? styles.upwards : ''}` }
        >
          <div className={ styles.menuItem }>Edit</div>
          <div className={ styles.menuItem }>Delete</div>
        </div>
      ) }
    </div>
  );
};

export default MessageItem;
