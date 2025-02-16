import React, { useEffect, useState } from 'react';
import styles from "./ChatItem.module.scss";
import userIcon from "../../../../assets/user.svg";
import sentIcon from "../../../../assets/checkmark.svg";
import delivered from "../../../../assets/delivered.svg";
import seen from "../../../../assets/seen.svg";
import { updateContact, setCurrentChat } from "../../../../store/chatSlice";
import { storage, auth } from "../../../../Firebase/firebase";
import { ref, getDownloadURL } from "firebase/storage";

import { onAuthStateChanged } from 'firebase/auth';

import { MESSAGE_STATUS } from "../../../../Helpers/Constants";
import { useSelector, useDispatch } from 'react-redux';


function ChatItem(props) {
  const dispatch = useDispatch();
  const [showUser, setShowUser] = useState(false);
  let currentChat = useSelector((state) => state.chat.currentChat.contact.email);
  let containerStyle = styles.chatItemContainer + " " + (currentChat === props.email ? styles.currentChat : " ");
  const [numberUnread, setNumberUnread] = useState(0);
  
  let chatStatus = props.email === props.chat.user1Email ? props.chat.chatStatus.user2Del : props.chat.chatStatus.user1Del;

  let chat = useSelector((state) => state.chat);
  const [profilePic, setProfilePic] = useState("");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {

        if (props.contactUID !== undefined) {

          const contactRef = ref(storage, `profile-pics/${props.contactUID}`);
          getDownloadURL(contactRef).then((url) => {
            setProfilePic(url);
            setShowUser(true);
          }).catch((error) => {
          });


        }
        getUnreadMessagesCount(props.chat.messages);
      }
    });

    return () => unsubscribe();
  }, [props.contactUID, dispatch, props.chat.messages]);


  const handleChatItemOnClick = () => {
    let currentChat = {
      chatId: props.chat.id,
      lastSeen: "",
      contact: {
        profilePic: profilePic,
        email: props.email,
        uid: props.contactUID,
      },
      messages: props.chat.messages,
      chatStatus: props.chat.chatStatus
    };

    dispatch(setCurrentChat(currentChat));
  };

  useEffect(() => {
  
    if (chat.currentChat?.contact?.uid && !chat.currentChat.contact.profilePic) {
      const contactRef = ref(storage, `profile-pics/${chat.currentChat.contact.uid}`);
  
      getDownloadURL(contactRef)
        .then((url) => {
          if (chat.currentChat.contact.profilePic !== url) {  
            dispatch(updateContact({ profilePic: url }));
          }
        })
        .catch((error) => {
          console.error("Error fetching profile pic:", error);
        });
    }
  }, [chat.currentChat.contact.profilePic, chat.currentChat.contact.uid, dispatch]); 
  

  const getUnreadMessagesCount = (arr) => {
    for (let i = arr.length - 1; i >= 0; i--) {
      if (arr[i].status === MESSAGE_STATUS.SEEN) {
        setNumberUnread(arr.length - i);
      }
    }
    setNumberUnread(0);
  };

  const convertTimestamp = (timestamp) => {
    var ts = new Date(timestamp);
    return (ts.Date === new Date().Date && ts.Month !== new Date().Date) ? ts.toTimeString().slice(0, 5) : ts.toLocaleString("de").slice(0, -10);
  };

  return !chatStatus && (
    <div className={ containerStyle } onClick={ handleChatItemOnClick } >
      <div className={ !showUser ? styles.contactPic : styles.contactPicBG }>
        <img className={ styles.contactPicImg } src={ showUser ? profilePic : userIcon } alt="Profile" />

      </div>
      <div className={ styles.chatInfo }>
        <div className={ styles.chatItemProfile }>
          <div className={ styles.chatTitle } >
            <div>
              { props.email }
            </div>
            <div className={ styles.statusAndTime }>
              <div className={ styles.icons }>
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
              <div>
                { convertTimestamp(props.timestamp) }
              </div>
            </div>
          </div>

        </div>
        <div className={ styles.chatItemMostRecentMessageSeen }>
          <div>
            { props.chat.messages.at(-1).content }
          </div>
          <div className={ styles.chatItemNumberOfUnreadMessages }>
            { numberUnread !== 0 && (<div>
              { numberUnread }
            </div>) }
          </div>
        </div>
      </div>

    </div>
  );
}

export default ChatItem;