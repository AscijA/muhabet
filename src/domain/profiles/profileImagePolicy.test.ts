import { MAX_PROFILE_IMAGE_BYTES, validateProfileImage } from "./profileImagePolicy";

describe("profile image policy", () => {
  it("accepts a supported image within the size limit", () => {
    expect(validateProfileImage({ type: "image/png", size: 1024 })).toEqual({ ok: true });
  });

  it("rejects unsupported content types", () => {
    expect(validateProfileImage({ type: "image/svg+xml", size: 1024 })).toEqual({
      ok: false,
      message: "Choose a JPEG, PNG, WebP, or GIF image.",
    });
  });

  it("rejects oversized images", () => {
    expect(validateProfileImage({ type: "image/jpeg", size: MAX_PROFILE_IMAGE_BYTES + 1 })).toEqual({
      ok: false,
      message: "Profile images must be smaller than 5 MB.",
    });
  });
});
