import { UserDirectoryRepository } from "src/domain/identity/UserDirectoryRepository";
import { E2E_USER } from "src/e2e/mockBackend";

export class InMemoryUserDirectoryRepository implements UserDirectoryRepository {
  private readonly users = new Map([
    [E2E_USER.email.toLowerCase(), E2E_USER.uid],
    ["taylor@example.com", "user-taylor"],
  ]);
  findByEmail = async (email: string) => this.users.get(email.trim().toLowerCase()) || null;
}
