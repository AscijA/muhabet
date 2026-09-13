import { UserId } from "./User";

export interface UserDirectoryRepository {
  findByEmail(email: string): Promise<UserId | null>;
}
