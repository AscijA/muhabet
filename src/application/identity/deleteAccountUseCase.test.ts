import { createDeleteAccountUseCase } from "./deleteAccountUseCase";

describe("delete account use case", () => {
  it("clears account-scoped client state after server-side deletion succeeds", async () => {
    const calls: string[] = [];
    const deleteAccount = createDeleteAccountUseCase({
      profiles: {
        endSession: async () => { calls.push("cache"); },
      } as any,
      auth: { deleteAccount: async () => { calls.push("auth"); return { ok: true, value: undefined }; } } as any,
    });

    await expect(deleteAccount()).resolves.toEqual({ ok: true, value: undefined });
    expect(calls).toEqual(["auth", "cache"]);
  });

  it("does not clear local state when the server rejects deletion", async () => {
    const endSession = vi.fn();
    const deleteAccount = createDeleteAccountUseCase({
      profiles: { endSession } as any,
      auth: { deleteAccount: async () => ({ ok: false, reason: "requires-recent-login" }) } as any,
    });
    await expect(deleteAccount()).resolves.toMatchObject({ ok: false });
    expect(endSession).not.toHaveBeenCalled();
  });
});
