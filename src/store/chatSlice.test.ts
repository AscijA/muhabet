import { selectCurrentChat } from "./chatSlice";
import type { RootState } from "./store";

describe("selectCurrentChat", () => {
  it("returns the same reference for unchanged inputs", () => {
    const state = {
      chat: {
        selectedConversationId: "chat-1",
        selectedContact: { uid: "user-2", email: "person@example.com", profilePic: "" },
        entities: { "chat-1": { messages: [] } },
      },
    } as unknown as RootState;

    expect(selectCurrentChat(state)).toBe(selectCurrentChat(state));
  });
});
