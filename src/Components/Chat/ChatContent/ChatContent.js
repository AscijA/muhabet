import React from 'react';
import styles from "./ChatContent.module.scss";
import { useSelector } from 'react-redux';
import BasicModal from '../../Common/BasicModal/BasicModal';
import { useDispatch } from 'react-redux';
import { toggleShowChatInfo } from '../../../store/chatSlice';

function ChatContent() {
  return (
    <div>Content</div>
  );
}

export default ChatContent;