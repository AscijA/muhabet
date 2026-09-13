import { FirebaseStorage, deleteObject, getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { ProfileImage, ProfileRepository } from "src/domain/profiles/ProfileRepository";
import { UserId } from "src/domain/identity/User";
import { clearContactImages, deleteContactImage, getContactImage, saveContactImage } from "src/Helpers/idb";

export class FirebaseProfileRepository implements ProfileRepository {
  private activeUserId = "";
  private readonly objectUrls = new Map<UserId, string>();
  constructor(private readonly storage: FirebaseStorage) {}

  startSession = (userId: UserId) => { this.activeUserId = userId; };

  endSession = async () => {
    this.objectUrls.forEach(url => URL.revokeObjectURL(url));
    this.objectUrls.clear();
    if (this.activeUserId) await clearContactImages(this.activeUserId);
    this.activeUserId = "";
  };

  getImage = async (userId: UserId): Promise<ProfileImage | null> => {
    const cached = this.activeUserId ? await getContactImage(this.activeUserId, userId) : undefined;
    if (cached) {
      this.revokeObjectUrl(userId);
      const url = URL.createObjectURL(cached);
      this.objectUrls.set(userId, url);
      return { url, contentType: cached.type };
    }
    try {
      const url = await getDownloadURL(ref(this.storage, `profile-pics/${userId}`));
      return { url };
    } catch { return null; }
  };

  uploadImage = async (userId: UserId, file: File): Promise<ProfileImage> => {
    const imageRef = ref(this.storage, `profile-pics/${userId}`);
    await uploadBytes(imageRef, file);
    if (this.activeUserId) await saveContactImage(this.activeUserId, userId, file);
    return { url: await getDownloadURL(imageRef), contentType: file.type };
  };

  removeImage = async (userId: UserId) => {
    await deleteObject(ref(this.storage, `profile-pics/${userId}`));
    if (this.activeUserId) await deleteContactImage(this.activeUserId, userId);
    this.revokeObjectUrl(userId);
  };

  clearLocalCache = async (userId: UserId) => {
    if (this.activeUserId) await deleteContactImage(this.activeUserId, userId);
    this.revokeObjectUrl(userId);
  };

  private revokeObjectUrl = (userId: UserId) => {
    const url = this.objectUrls.get(userId);
    if (url) URL.revokeObjectURL(url);
    this.objectUrls.delete(userId);
  };
}
