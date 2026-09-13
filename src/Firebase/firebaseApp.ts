import { initializeApp } from "firebase/app";
import { initializeAppCheck, ReCaptchaEnterpriseProvider } from "firebase/app-check";
import { getAppCheckSiteKey, getFirebaseEnvironment } from "src/app/environment";

const firebaseConfig = getFirebaseEnvironment();

export const firebaseApp = initializeApp(firebaseConfig);

const appCheckSiteKey = getAppCheckSiteKey();
if (appCheckSiteKey) {
  initializeAppCheck(firebaseApp, {
    provider: new ReCaptchaEnterpriseProvider(appCheckSiteKey),
    isTokenAutoRefreshEnabled: true,
  });
}

export const bucket = firebaseConfig.storageBucket;
