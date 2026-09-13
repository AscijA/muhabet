export type UserId = string;

export type User = {
  uid: UserId;
  email: string;
  profilePic: string;
  contacts: unknown[];
};

export type AuthenticatedUser = User & {
  displayName: string;
  emailVerified: boolean;
  createdAt: string | number;
  settings: Record<string, unknown> | null;
};
