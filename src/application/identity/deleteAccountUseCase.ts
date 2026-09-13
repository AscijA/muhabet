import { AuthGateway, AuthResult } from "src/domain/identity/AuthGateway";
import { ProfileRepository } from "src/domain/profiles/ProfileRepository";

type Dependencies = {
  auth: AuthGateway;
  profiles: ProfileRepository;
};

export const createDeleteAccountUseCase = (dependencies: Dependencies) => async (
): Promise<AuthResult<void>> => {
  const result = await dependencies.auth.deleteAccount();
  if (!result.ok) return result;
  await dependencies.profiles.endSession();
  return result;
};
