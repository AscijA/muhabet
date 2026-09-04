export interface User {
  uid: string;
  email: string;
  profilePic: string;
  contacts: any[];
}

export interface Participant {
  userID: string;
  email: string;
  blockStatus: boolean;
  deleteStatus: boolean;
}

export type MessageStatus = "SENT" | "DELIVERED" | "SEEN" | "";
export type ContentType = "text" | "image" | "";

export interface Message {
  messageID: string;
  content: string;
  contentType: ContentType;
  ownerID: string;
  timestamp: number | string;
  messageStatus: MessageStatus;
  replyTo?: string | null;
}

export interface LastMessageStatus {
  status: string;
  userID: string;
}

export interface ChatContact {
  uid: string;
  email: string;
  profilePic: string;
}

export interface Chat {
  id: string;
  chatId?: string; // used interchangeably
  participants: Participant[];
  participantIDs: string[];
  lastMessageStatus?: LastMessageStatus;
  messages: Message[];
  lastModified: number | string;
  showChatInfo?: boolean; 
  contact?: ChatContact;
  lastSeen?: string;
}
