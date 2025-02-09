import React, { useEffect, useRef, useState } from 'react';
import styles from "./MessageItem.module.scss";
import { MESSAGE_STATUS } from 'src/Helpers/Constants';
import sentIcon from "../../../assets/checkmark.svg";
import delivered from "../../../assets/delivered.svg";
import seen from "../../../assets/seen.svg";



// Single Message Component for both own and other messages
const MessageItem = ({ text, timestamp, isOwnMessage, deliveryStatus }) => {
  const [showMessageMenu, setShowMessageMenu] = useState(false);
  const [renderUpwards, setRenderUpwards] = useState(false); // State to track if menu should render upwards
  const menuRef = useRef(null);
  const messageRef = useRef(null); // Ref for the message container
  const messageType = `${styles.message} ${isOwnMessage ? styles.ownMessage : styles.otherMessage}`;

  const toggleMenu = (event) => {
    event.preventDefault();
    setShowMessageMenu((prev) => !prev);
  };

  const closeMenu = (event) => {
    if (menuRef.current && !menuRef.current.contains(event.target) && !messageRef.current.contains(event.target)) {
      setShowMessageMenu(false);
    }
  };

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
        <div className={ styles.messageContent }>{ text }</div>
        <div className={ styles.messageTimestamp }>{ (timestamp.Date === new Date().Date && timestamp.Month !== new Date().Date) ? timestamp.toTimeString().slice(0,5) : timestamp.toLocaleString("de").slice(0,-3) }
          <div className={ styles.icons }>
            { deliveryStatus === MESSAGE_STATUS.SENT && (
              <img className={ "" } src={ sentIcon } alt="Delivery Status: Sent" />
            ) }

            { deliveryStatus === MESSAGE_STATUS.DELIVERED && (
              <img className={ "" } src={ delivered } alt="Delivery Status: Delivered" />
            ) }

            { deliveryStatus === MESSAGE_STATUS.SEEN && (
              <img className={ "" } src={ seen } alt="Delivery Status: Seen" />
            ) }


          </div>

        </div>
      </div>
      <div className={ styles.dotMenu } onClick={ toggleMenu }>
        &#8942;
      </div>
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
