export const MAX_PROFILE_IMAGE_BYTES = 5 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);

export type ProfileImageValidation = { ok: true } | { ok: false; message: string };

export const validateProfileImage = (file: Pick<File, "size" | "type">): ProfileImageValidation => {
  if (!ALLOWED_IMAGE_TYPES.has(file.type)) {
    return { ok: false, message: "Choose a JPEG, PNG, WebP, or GIF image." };
  }
  if (file.size > MAX_PROFILE_IMAGE_BYTES) {
    return { ok: false, message: "Profile images must be smaller than 5 MB." };
  }
  return { ok: true };
};
