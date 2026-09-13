import { AuthGateway, AuthResult } from "src/domain/identity/AuthGateway";
import { AuthenticatedUser } from "src/domain/identity/User";
import { E2E_SESSION_KEY, E2E_USER } from "src/e2e/mockBackend";

export class InMemoryAuthGateway implements AuthGateway {
  private observers: Array<(user: AuthenticatedUser | null) => void> = [];

  watchSession = (observer: (user: AuthenticatedUser | null) => void) => {
    this.observers.push(observer);
    observer(localStorage.getItem(E2E_SESSION_KEY) ? E2E_USER : null);
    return () => { this.observers = this.observers.filter(item => item !== observer); };
  };

  signIn = async (email: string, password: string): Promise<AuthResult<AuthenticatedUser>> => {
    if (email !== E2E_USER.email || password !== "password123") {
      return { ok: false, reason: "invalid-credentials" };
    }
    localStorage.setItem(E2E_SESSION_KEY, "signed-in");
    this.observers.forEach(observer => observer(E2E_USER));
    return { ok: true, value: E2E_USER };
  };

  register = async (email: string, password: string): Promise<AuthResult<AuthenticatedUser>> => {
    if (!email.includes("@")) return { ok: false, reason: "invalid-email" };
    if (password.length < 6) return { ok: false, reason: "weak-password" };
    return { ok: true, value: { ...E2E_USER, email } };
  };

  sendPasswordReset = async (email: string): Promise<AuthResult<void>> =>
    email.includes("@") ? { ok: true, value: undefined } : { ok: false, reason: "invalid-email" };

  signOut = async (): Promise<AuthResult<void>> => {
    localStorage.removeItem(E2E_SESSION_KEY);
    this.observers.forEach(observer => observer(null));
    return { ok: true, value: undefined };
  };

  deleteAccount = this.signOut;
}
