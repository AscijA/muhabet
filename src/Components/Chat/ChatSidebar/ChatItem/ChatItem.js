import React, { useState } from 'react';
import styles from "./ChatItem.module.scss";
import userIcon from "../../../../assets/user.svg";
import sentIcon from "../../../../assets/checkmark.svg";
import delivered from "../../../../assets/delivered.svg";
import seen from "../../../../assets/seen.svg";


// import delivered from "../../../../assets/delivered.svg";
// import sent from "../../../../assets/sent.svg";

function ChatItem(props) {
  const [showUser, setShowUser] = useState(false);

  return (
    <div className={ styles.chatItemContainer }>
      <div className={ !showUser ? styles.contactPic : styles.contactPicBG }>
        <img className={ styles.contactPicImg } src={ showUser ? "" : userIcon } alt="Profile" />

      </div>
      <div className={ styles.chatInfo }>
        <div className={ styles.chatItemProfile }>
          <div className={ styles.chatTitle } >
            <div>
              ascija111@gmail.com
            </div>
            <div className={ styles.statusAndTime }>
              <div className={styles.icons}>
                <img className={ "" } src={ sentIcon } alt="Delivery Status" />
                <img className={ "" } src={ delivered } alt="Delivery Status" />
                <img className={ "" } src={ seen } alt="Delivery Status" />

              </div>
              <div>
                20:15
              </div>
            </div>
          </div>

        </div>
        <div className={ styles.chatItemMostRecentMessageSeen }>
          <div>
            Message text
          </div>
          <div className={ styles.chatItemNumberOfUnreadMessages }>
            <div>
              5
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}

export default ChatItem;