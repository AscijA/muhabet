import { createMessageUseCases } from "./messageUseCases";

describe("message use cases", () => {
  const useCases = createMessageUseCases({} as never);

  it("omits optional replyTo when a message is not a reply", () => {
    const message = useCases.create("user-1", "Hello");
    expect(message).not.toHaveProperty("replyTo");
  });

  it("preserves replyTo when replying to a message", () => {
    expect(useCases.create("user-1", "Hello", "message-1")).toMatchObject({ replyTo: "message-1" });
  });
});
