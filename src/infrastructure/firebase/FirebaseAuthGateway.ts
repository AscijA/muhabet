import {
  Auth,
  AuthError,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import { Functions, httpsCallable } from "firebase/functions";
import { AuthFailure, AuthGateway, AuthResult } from "src/domain/identity/AuthGateway";
import { AuthenticatedUser } from "src/domain/identity/User";

const toUser = (user: import("firebase/auth").User): AuthenticatedUser => ({
  uid: user.uid,
  email: user.email || "",
  displayName: user.displayName || "",
  emailVerified: user.emailVerified,
  createdAt: user.metadata.creationTime || "",
  contacts: [],
  profilePic: "",
  settings: null,
});

const toFailure = (error: unknown): AuthFailure => {
  const code = (error as AuthError)?.code;
  if (code === "auth/invalid-email") return "invalid-email";
  if (code === "auth/weak-password") return "weak-password";
  if (code === "auth/email-already-in-use") return "email-in-use";
  if (code === "auth/user-not-found") return "user-not-found";
  if (code === "auth/invalid-credential" || code === "auth/wrong-password") return "invalid-credentials";
  if (code === "functions/failed-precondition" || code === "auth/requires-recent-login") return "requires-recent-login";
  return "unknown";
};

export class FirebaseAuthGateway implements AuthGateway {
  constructor(private readonly auth: Auth, private readonly functions: Functions) {}

  watchSession = (observer: (user: AuthenticatedUser | null) => void) =>
    onAuthStateChanged(this.auth, user => observer(user ? toUser(user) : null));

  signIn = async (email: string, password: string): Promise<AuthResult<AuthenticatedUser>> => {
    try {
      const credential = await signInWithEmailAndPassword(this.auth, email, password);
      return { ok: true, value: toUser(credential.user) };
    } catch (error) { return { ok: false, reason: toFailure(error) }; }
  };

  register = async (email: string, password: string): Promise<AuthResult<AuthenticatedUser>> => {
    try {
      const credential = await createUserWithEmailAndPassword(this.auth, email, password);
      const user = toUser(credential.user);
      await httpsCallable(this.functions, "ensureCurrentUserDirectory")();
      return { ok: true, value: user };
    } catch (error) { return { ok: false, reason: toFailure(error) }; }
  };

  sendPasswordReset = async (email: string): Promise<AuthResult<void>> => {
    try { await sendPasswordResetEmail(this.auth, email); return { ok: true, value: undefined }; }
    catch (error) { return { ok: false, reason: toFailure(error) }; }
  };

  signOut = async (): Promise<AuthResult<void>> => {
    try { await signOut(this.auth); return { ok: true, value: undefined }; }
    catch (error) { return { ok: false, reason: toFailure(error) }; }
  };

  deleteAccount = async (): Promise<AuthResult<void>> => {
    if (!this.auth.currentUser) return { ok: false, reason: "user-not-found" };
    try {
      await httpsCallable(this.functions, "deleteCurrentAccount")();
      return { ok: true, value: undefined };
    }
    catch (error) { return { ok: false, reason: toFailure(error) }; }
  };
}
