import React, { useEffect, useRef, useState, useMemo } from 'react';
import styles from "./MessageItem.module.scss";
import { MESSAGE_STATUS } from 'src/Helpers/Constants';

import sentIcon from "../../../assets/checkmark.svg";
import delivered from "../../../assets/delivered.svg";
import seen from "../../../assets/seen.svg";

/**
 * @param {boolean} isOwnMessage
 * @param {string}  text
 * @param {number}  timestampMs
 * @param {string}  deliveryStatus
 * @param {string}  messageID
 * @param {HTMLElement|null} rootEl
 * @param {(id: string) => void} onVisibleSeen
 */
const MessageItem = ({
  isOwnMessage,
  text,
  timestampMs,
  deliveryStatus,
  messageID,
  rootEl,
  onVisibleSeen,
  setMessage,
  setButtonAction,
  handleDeleteMessage
}) => {
  const [showMessageMenu, setShowMessageMenu] = useState(false);
  const [renderUpwards, setRenderUpwards] = useState(false);
  const menuRef = useRef(null);
  const messageRef = useRef(null);
  const seenReportedRef = useRef(false);

  const messageType = `${styles.message} ${isOwnMessage ? styles.ownMessage : styles.otherMessage}`;

  const toggleMenu = (event) => {
    if (isOwnMessage) {
      event.preventDefault();
      setShowMessageMenu((prev) => !prev);
    }
  };

  const closeMenu = (event) => {
    const menuEl = menuRef.current;
    const msgEl = messageRef.current;
    if (!menuEl || !msgEl) return;
    if (!menuEl.contains(event.target) && !msgEl.contains(event.target)) {
      setShowMessageMenu(false);
    }
  };

  useEffect(() => {
    if (!showMessageMenu) return;
    document.addEventListener("click", closeMenu);

    const msgEl = messageRef.current;
    if (msgEl) {
      const rect = msgEl.getBoundingClientRect();
      const menuHeight = 80;
      const spaceBelow = window.innerHeight - rect.bottom;
      const spaceAbove = rect.top;
      setRenderUpwards(spaceBelow < menuHeight && spaceAbove >= menuHeight);
    }
    return () => { document.removeEventListener("click", closeMenu); };
  }, [showMessageMenu]);

  const timeText = useMemo(() => {
    if (!timestampMs) return "";
    const d = new Date(timestampMs);
    const now = new Date();
    const sameDay =
      d.getFullYear() === now.getFullYear() &&
      d.getMonth() === now.getMonth() &&
      d.getDate() === now.getDate();
    if (sameDay) return d.toTimeString().slice(0, 5);
    const s = d.toLocaleString("de");
    return s.replace(/:\d{2}(?!:)/, "");
  }, [timestampMs]);

  useEffect(() => {
    if (isOwnMessage || deliveryStatus === MESSAGE_STATUS.SEEN) return;

    const target = messageRef.current;
    if (!target) return;

    const isVisibleNow = () => {
      const root = rootEl || document.documentElement;
      const rootRect = root === document.documentElement
        ? { top: 0, left: 0, right: window.innerWidth, bottom: window.innerHeight }
        : root.getBoundingClientRect();
      const rect = target.getBoundingClientRect();

      const width = Math.min(rect.right, rootRect.right) - Math.max(rect.left, rootRect.left);
      const height = Math.min(rect.bottom, rootRect.bottom) - Math.max(rect.top, rootRect.top);
      const visibleArea = Math.max(0, width) * Math.max(0, height);
      const itemArea = (rect.width || 1) * (rect.height || 1);
      return visibleArea / itemArea >= 0.6;
    };

    const raf = requestAnimationFrame(() => {
      if (!seenReportedRef.current && isVisibleNow()) {
        seenReportedRef.current = true;
        onVisibleSeen?.(messageID);
      }
    });

    const io = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (!seenReportedRef.current && entry.isIntersecting && entry.intersectionRatio >= 0.6) {
          seenReportedRef.current = true;
          onVisibleSeen?.(messageID);
          io.disconnect();
        }
      },
      { root: rootEl || null, threshold: [0, 0.6, 1], rootMargin: '0px 0px -4% 0px' }
    );

    io.observe(target);
    return () => { cancelAnimationFrame(raf); io.disconnect(); };
  }, [isOwnMessage, deliveryStatus, onVisibleSeen, messageID, rootEl]);

  const handleEditClick = () => {
    setShowMessageMenu(false);
    setButtonAction("Edit");
    setMessage({ content: text, messageID: messageID });
  };

  const handleDeleteClick = () => {
    setShowMessageMenu(false);
    handleDeleteMessage(messageID);
  };

  return (
    <div ref={ messageRef } className={ messageType } onContextMenu={ toggleMenu }>
      <div>
        <div className={ styles.messageContent }>
          { text ? text : <em>*This message was deleted*</em> }
        </div>

        <div className={ styles.messageTimestamp }>
          { timeText }

          { isOwnMessage && (
            <div className={ styles.icons }>
              { deliveryStatus === MESSAGE_STATUS.SENT && <img src={ sentIcon } alt="Delivery Status: Sent" /> }
              { deliveryStatus === MESSAGE_STATUS.DELIVERED && <img src={ delivered } alt="Delivery Status: Delivered" /> }
              { deliveryStatus === MESSAGE_STATUS.SEEN && <img src={ seen } alt="Delivery Status: Seen" /> }
              {}
            </div>
          ) }
        </div>
      </div>

      { isOwnMessage && (
        <div className={ styles.dotMenu } onClick={ toggleMenu } aria-haspopup="menu" aria-expanded={ showMessageMenu }>
          &#8942;
        </div>
      ) }

      { showMessageMenu && (
        <div
          ref={ menuRef }
          className={ `${styles.customMenu} ${renderUpwards ? styles.upwards : ""}` }
          role="menu"
        >
          <div className={ styles.menuItem } role="menuitem" onClick={ handleEditClick }>Edit</div>
          <div className={ styles.menuItem } role="menuitem" onClick={ handleDeleteClick }>Delete</div>
        </div>
      ) }
    </div>
  );
};

function areEqual(prev, next) {
  return (
    prev.isOwnMessage === next.isOwnMessage &&
    prev.text === next.text &&
    prev.deliveryStatus === next.deliveryStatus &&
    prev.timestampMs === next.timestampMs &&
    prev.messageID === next.messageID &&
    prev.rootEl === next.rootEl
  );
}

export default React.memo(MessageItem, areEqual);
