type FirebaseEnvironment = {
  apiKey: string;
  authDomain: string;
  databaseURL?: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
  measurementId?: string;
};

const readRequired = (name: keyof ImportMetaEnv, legacyName: keyof ImportMetaEnv): string => {
  const value = (import.meta.env[name] || import.meta.env[legacyName])?.trim();
  if (value) return value;
  throw new Error(`Missing required environment variable: ${name}`);
};

const readOptional = (name: keyof ImportMetaEnv, legacyName: keyof ImportMetaEnv): string | undefined => {
  const value = (import.meta.env[name] || import.meta.env[legacyName])?.trim();
  return value || undefined;
};

export const getFirebaseEnvironment = (): FirebaseEnvironment => ({
  apiKey: readRequired("VITE_API_KEY", "REACT_APP_API_KEY"),
  authDomain: readRequired("VITE_AUTH_DOMAIN", "REACT_APP_AUTH_DOMAIN"),
  databaseURL: readOptional("VITE_DATABASE_URL", "REACT_APP_DATABASE_URL"),
  projectId: readRequired("VITE_PROJECT_ID", "REACT_APP_PROJECT_ID"),
  storageBucket: readRequired("VITE_STORAGE_BUCKET", "REACT_APP_STORAGE_BUCKET"),
  messagingSenderId: readRequired("VITE_MESSAGING_SENDER_ID", "REACT_APP_MESSAGING_SENDER_ID"),
  appId: readRequired("VITE_APP_ID", "REACT_APP_APP_ID"),
  measurementId: readOptional("VITE_MEASUREMENT_ID", "REACT_APP_MEASUREMENT_ID"),
});

export const getAppCheckSiteKey = () => readOptional("VITE_APP_CHECK_SITE_KEY", "REACT_APP_APP_CHECK_SITE_KEY");
