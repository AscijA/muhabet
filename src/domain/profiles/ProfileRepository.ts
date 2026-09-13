import { UserId } from "src/domain/identity/User";

export type ProfileImage = {
  url: string;
  contentType?: string;
};

export interface ProfileRepository {
  startSession(userId: UserId): void;
  endSession(): Promise<void>;
  getImage(userId: UserId): Promise<ProfileImage | null>;
  uploadImage(userId: UserId, file: File): Promise<ProfileImage>;
  removeImage(userId: UserId): Promise<void>;
  clearLocalCache(userId: UserId): Promise<void>;
}
