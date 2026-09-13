import { AuthGateway } from "src/domain/identity/AuthGateway";
import { auth, cloudFunctions } from "src/Firebase/auth";
import { FirebaseAuthGateway } from "src/infrastructure/firebase/FirebaseAuthGateway";
import { InMemoryAuthGateway } from "src/infrastructure/testing/InMemoryAuthGateway";

const authGateway: AuthGateway = import.meta.env.VITE_E2E === "true"
  ? new InMemoryAuthGateway()
  : new FirebaseAuthGateway(auth, cloudFunctions);

export const authServices = { auth: authGateway };
