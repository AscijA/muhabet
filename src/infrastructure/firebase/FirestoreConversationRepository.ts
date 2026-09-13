import {
  Firestore, collection, doc, endBefore, getDocs, limit, limitToLast, onSnapshot, orderBy, query, serverTimestamp,
  setDoc, updateDoc, where, Timestamp,
} from "firebase/firestore";
import { Conversation, ConversationId, ConversationParticipant } from "src/domain/conversations/Conversation";
import { ConversationRepository } from "src/domain/conversations/ConversationRepository";
import { Message, MessageId, MessageStatus } from "src/domain/conversations/Message";
import { UserId } from "src/domain/identity/User";

const millis = (value: unknown): number => {
  if (value && typeof (value as { toMillis?: unknown }).toMillis === "function") {
    return (value as { toMillis: () => number }).toMillis();
  }
  if (value instanceof Date) return value.getTime();
  if (typeof value === "number") return value;
  const parsed = Date.parse(String(value || ""));
  return Number.isNaN(parsed) ? 0 : parsed;
};

export class FirestoreConversationRepository implements ConversationRepository {
  constructor(private readonly firestore: Firestore) {}

  watchForUser = (userId: UserId, observer: (items: Conversation[]) => void, pageSize = 50) => {
    const conversations = new Map<ConversationId, Conversation>();
    const messageUnsubscribers = new Map<ConversationId, () => void>();
    const emit = () => observer([...conversations.values()].sort((a, b) => millis(b.lastModified) - millis(a.lastModified)));
    const chatsQuery = query(collection(this.firestore, "chats"), where("participantIDs", "array-contains", userId), orderBy("lastModified", "desc"), limit(pageSize));

    const unsubscribeChats = onSnapshot(chatsQuery, snapshot => {
      snapshot.docChanges().forEach(change => {
        if (change.type === "removed") {
          conversations.delete(change.doc.id);
          messageUnsubscribers.get(change.doc.id)?.();
          messageUnsubscribers.delete(change.doc.id);
          return;
        }
        const data = change.doc.data();
        const previous = conversations.get(change.doc.id);
        conversations.set(change.doc.id, {
          id: change.doc.id, chatId: change.doc.id,
          participants: data.participants || [], participantIDs: data.participantIDs || [],
          lastMessageStatus: data.lastMessageStatus, lastModified: millis(data.lastModified),
          messages: previous?.messages || [],
        });
        if (messageUnsubscribers.has(change.doc.id)) return;
        const messagesQuery = query(collection(this.firestore, "chats", change.doc.id, "messages"), orderBy("timestamp", "asc"), limitToLast(pageSize));
        messageUnsubscribers.set(change.doc.id, onSnapshot(messagesQuery, messagesSnapshot => {
          const current = conversations.get(change.doc.id);
          if (!current) return;
          const messages = messagesSnapshot.docs.map(messageDoc => ({
            ...messageDoc.data(), messageID: messageDoc.id,
            timestamp: millis(messageDoc.data().timestamp),
            messageStatus: messageDoc.data().messageStatus || "SENT",
          } as Message));
          conversations.set(change.doc.id, { ...current, messages });
          emit();
        }));
      });
      emit();
    });

    return () => {
      unsubscribeChats();
      messageUnsubscribers.forEach(unsubscribe => unsubscribe());
      messageUnsubscribers.clear();
    };
  };

  getMessagePage = async (conversationId: ConversationId, before?: number, pageSize = 50) => {
    const source = collection(this.firestore, "chats", conversationId, "messages");
    const constraints = before
      ? [orderBy("timestamp", "desc"), endBefore(Timestamp.fromMillis(before)), limit(pageSize)]
      : [orderBy("timestamp", "desc"), limit(pageSize)];
    const snapshot = await getDocs(query(source, ...constraints));
    return snapshot.docs.map(item => ({ ...item.data(), messageID: item.id, timestamp: millis(item.data().timestamp) } as Message)).reverse();
  };

  create = async (participants: ConversationParticipant[]) => {
    const participantIDs = participants.map(item => item.userID).sort();
    const reference = doc(this.firestore, "chats", participantIDs.join("_"));
    await setDoc(reference, { participants, participantIDs, lastModified: serverTimestamp(), lastMessageStatus: { status: "", userID: "" } }, { merge: true });
    return reference.id;
  };

  updateParticipants = async (conversationId: ConversationId, participants: ConversationParticipant[]) => {
    await updateDoc(doc(this.firestore, "chats", conversationId), { participants, lastModified: serverTimestamp() });
  };

  anonymizeUser = async (userId: UserId) => {
    const snapshot = await getDocs(query(collection(this.firestore, "chats"), where("participantIDs", "array-contains", userId)));
    await Promise.all(snapshot.docs.map(async chat => {
      const participants = (chat.data().participants || []).map((participant: ConversationParticipant) =>
        participant.userID === userId
          ? { ...participant, email: "Deleted account", deleteStatus: true }
          : participant,
      );
      await updateDoc(chat.ref, { participants, lastModified: serverTimestamp() });
    }));
  };

  sendMessage = async (conversationId: ConversationId, message: Message) => {
    await setDoc(doc(this.firestore, "chats", conversationId, "messages", message.messageID), message);
    await updateDoc(doc(this.firestore, "chats", conversationId), { lastModified: serverTimestamp() });
  };

  updateMessage = async (conversationId: ConversationId, messageId: MessageId, changes: Partial<Message>) => {
    await updateDoc(doc(this.firestore, "chats", conversationId, "messages", messageId), changes);
  };

  updateMessageStatus = async (conversationId: ConversationId, messageId: MessageId, status: MessageStatus) => {
    await this.updateMessage(conversationId, messageId, { messageStatus: status });
  };
}
