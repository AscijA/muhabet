import { initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { FieldValue, getFirestore, QueryDocumentSnapshot } from "firebase-admin/firestore";
import { getStorage } from "firebase-admin/storage";
import * as functions from "firebase-functions/v1";
import { HttpsError, onCall } from "firebase-functions/v2/https";
import { createHash } from "node:crypto";

initializeApp();
const firestore = getFirestore();
const recentAuthenticationSeconds = 5 * 60;

const emailKey = (email: string) => createHash("sha256").update(email.trim().toLowerCase()).digest("hex");

const requireUser = (request: { auth?: { uid: string; token: Record<string, unknown> } | null }) => {
  if (!request.auth) throw new HttpsError("unauthenticated", "Sign in to continue.");
  return request.auth;
};

const requireRecentAuthentication = (auth: { token: Record<string, unknown> }) => {
  const authTime = Number(auth.token.auth_time || 0);
  if (Date.now() / 1000 - authTime > recentAuthenticationSeconds) {
    throw new HttpsError("failed-precondition", "Reauthenticate before deleting your account.");
  }
};

export const createUserDirectoryEntry = functions.auth.user().onCreate(async user => {
  if (!user.email) return;
  await firestore.collection("user-directory").doc(emailKey(user.email)).set({ uid: user.uid });
});

export const removeUserDirectoryEntry = functions.auth.user().onDelete(async user => {
  if (!user.email) return;
  await firestore.collection("user-directory").doc(emailKey(user.email)).delete();
});

export const ensureCurrentUserDirectory = onCall({ enforceAppCheck: true }, async request => {
  const auth = requireUser(request);
  const user = await getAuth().getUser(auth.uid);
  if (!user.email) throw new HttpsError("failed-precondition", "An email address is required.");
  await Promise.all([
    firestore.collection("user-directory").doc(emailKey(user.email)).set({ uid: user.uid }),
    firestore.collection("users").doc(user.uid).set({
      uid: user.uid,
      email: user.email,
      displayName: user.displayName || "",
      emailVerified: user.emailVerified,
      createdAt: user.metadata.creationTime || "",
      contacts: [],
      profilePic: "",
      settings: null,
    }, { merge: true }),
  ]);
  return { created: true };
});

export const resolveUserByEmail = onCall<{ email?: string }, Promise<{ uid: string | null }>>({ enforceAppCheck: true }, async request => {
  requireUser(request);
  const email = request.data.email?.trim().toLowerCase();
  if (!email || !email.includes("@")) throw new HttpsError("invalid-argument", "A valid email is required.");
  const entry = await firestore.collection("user-directory").doc(emailKey(email)).get();
  return { uid: entry.exists ? String(entry.data()?.uid) : null };
});

export const deleteCurrentAccount = onCall({ enforceAppCheck: true, consumeAppCheckToken: true }, async request => {
  const auth = requireUser(request);
  requireRecentAuthentication(auth);
  const user = await getAuth().getUser(auth.uid);
  const chats = await firestore.collection("chats").where("participantIDs", "array-contains", auth.uid).get();
  const writer = firestore.bulkWriter();
  chats.docs.forEach((chat: QueryDocumentSnapshot) => {
    const participants = (chat.data().participants || []).map((participant: { userID: string }) =>
      participant.userID === auth.uid ? { ...participant, email: "Deleted account", deleteStatus: true } : participant,
    );
    writer.update(chat.ref, { participants, lastModified: FieldValue.serverTimestamp() });
  });
  writer.delete(firestore.collection("users").doc(auth.uid));
  if (user.email) writer.delete(firestore.collection("user-directory").doc(emailKey(user.email)));
  await writer.close();
  await getStorage().bucket().file(`profile-pics/${auth.uid}`).delete({ ignoreNotFound: true });
  await getAuth().deleteUser(auth.uid);
  return { deleted: true };
});
