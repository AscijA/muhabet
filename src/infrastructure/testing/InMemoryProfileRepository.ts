import { ProfileImage, ProfileRepository } from "src/domain/profiles/ProfileRepository";

export class InMemoryProfileRepository implements ProfileRepository {
  private images = new Map<string, ProfileImage>();
  startSession = (_userId: string) => undefined;
  endSession = async () => { this.images.clear(); };
  getImage = async (userId: string) => this.images.get(userId) || null;
  uploadImage = async (userId: string, file: File) => {
    const image = { url: URL.createObjectURL(file), contentType: file.type };
    this.images.set(userId, image);
    return image;
  };
  removeImage = async (userId: string) => { this.images.delete(userId); };
  clearLocalCache = this.removeImage;
}
