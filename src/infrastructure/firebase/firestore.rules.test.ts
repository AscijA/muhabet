import { readFileSync } from "node:fs";
import { assertFails, assertSucceeds, initializeTestEnvironment, RulesTestEnvironment } from "@firebase/rules-unit-testing";
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";

const describeWithEmulator = process.env.FIRESTORE_EMULATOR_HOST ? describe : describe.skip;

describeWithEmulator("conversation security rules", () => {
  let environment: RulesTestEnvironment;
  beforeAll(async () => {
    environment = await initializeTestEnvironment({ projectId: "muhabet-rules-test", firestore: { rules: readFileSync("firestore.rules", "utf8") } });
  });
  beforeEach(async () => {
    await environment.clearFirestore();
    await environment.withSecurityRulesDisabled(async context => {
      await setDoc(doc(context.firestore(), "chats", "conversation-1"), { participantIDs: ["alice", "bob"], participants: [{ userID: "alice" }, { userID: "bob" }] });
    });
  });
  afterAll(async () => { await environment.cleanup(); });

  it("allows participants to exchange and acknowledge messages", async () => {
    const alice = environment.authenticatedContext("alice").firestore();
    const bob = environment.authenticatedContext("bob").firestore();
    const data = { messageID: "message-1", ownerID: "alice", content: "Hello", contentType: "text", messageStatus: "SENT", timestamp: 1 };
    await assertSucceeds(setDoc(doc(alice, "chats", "conversation-1", "messages", "message-1"), data));
    await assertSucceeds(getDoc(doc(bob, "chats", "conversation-1", "messages", "message-1")));
    await assertSucceeds(updateDoc(doc(bob, "chats", "conversation-1", "messages", "message-1"), { messageStatus: "SEEN" }));
  });

  it("rejects outsiders and cross-user content edits", async () => {
    await environment.withSecurityRulesDisabled(async context => {
      await setDoc(doc(context.firestore(), "chats", "conversation-1", "messages", "message-1"), { messageID: "message-1", ownerID: "alice", content: "Original", contentType: "text", messageStatus: "SENT", timestamp: 1 });
    });
    const alice = environment.authenticatedContext("alice").firestore();
    const bob = environment.authenticatedContext("bob").firestore();
    const outsider = environment.authenticatedContext("mallory").firestore();
    await assertFails(getDoc(doc(outsider, "chats", "conversation-1", "messages", "message-1")));
    await assertFails(updateDoc(doc(bob, "chats", "conversation-1", "messages", "message-1"), { content: "Tampered" }));
    await assertSucceeds(updateDoc(doc(alice, "chats", "conversation-1", "messages", "message-1"), { content: "Edited" }));
  });

  it("denies every client-side user-directory operation", async () => {
    const alice = environment.authenticatedContext("alice").firestore();
    const lookup = doc(alice, "user-directory", "opaque-email-hash");
    await assertFails(setDoc(lookup, { uid: "alice" }));
    await assertFails(getDoc(lookup));
  });
});
