import { advanceMessageStatus, canAdvanceMessageStatus } from "./messageStatus";

describe("message status transitions", () => {
  it("advances monotonically", () => {
    expect(advanceMessageStatus("", "SENT")).toBe("SENT");
    expect(advanceMessageStatus("SENT", "DELIVERED")).toBe("DELIVERED");
    expect(advanceMessageStatus("DELIVERED", "SEEN")).toBe("SEEN");
  });

  it("does not regress or repeat", () => {
    expect(canAdvanceMessageStatus("SEEN", "DELIVERED")).toBe(false);
    expect(advanceMessageStatus("SEEN", "DELIVERED")).toBe("SEEN");
    expect(advanceMessageStatus("DELIVERED", "DELIVERED")).toBe("DELIVERED");
  });
});
