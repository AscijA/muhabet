import { Functions, httpsCallable } from "firebase/functions";
import { UserDirectoryRepository } from "src/domain/identity/UserDirectoryRepository";

export class CallableUserDirectoryRepository implements UserDirectoryRepository {
  constructor(private readonly functions: Functions) {}

  findByEmail = async (email: string) => {
    const lookup = httpsCallable<{ email: string }, { uid: string | null }>(this.functions, "resolveUserByEmail");
    return (await lookup({ email })).data.uid;
  };
}
