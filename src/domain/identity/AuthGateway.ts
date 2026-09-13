import { AuthenticatedUser } from "./User";

export type AuthFailure =
  | "invalid-credentials"
  | "invalid-email"
  | "weak-password"
  | "email-in-use"
  | "user-not-found"
  | "requires-recent-login"
  | "unknown";

export type AuthResult<T> =
  | { ok: true; value: T }
  | { ok: false; reason: AuthFailure };

export interface AuthGateway {
  watchSession(observer: (user: AuthenticatedUser | null) => void): () => void;
  signIn(email: string, password: string): Promise<AuthResult<AuthenticatedUser>>;
  register(email: string, password: string): Promise<AuthResult<AuthenticatedUser>>;
  sendPasswordReset(email: string): Promise<AuthResult<void>>;
  signOut(): Promise<AuthResult<void>>;
  deleteAccount(): Promise<AuthResult<void>>;
}
