import { ConversationRepository } from "src/domain/conversations/ConversationRepository";
import { ConversationParticipant } from "src/domain/conversations/Conversation";
import { UserId } from "src/domain/identity/User";
import { UserDirectoryRepository } from "src/domain/identity/UserDirectoryRepository";

export const createConversationUseCases = (repository: ConversationRepository, directory: UserDirectoryRepository) => ({
  createWithEmail: async (currentUser: { uid: UserId; email: string }, contactEmail: string) => {
    if (!contactEmail) throw new Error("email-required");
    if (contactEmail === currentUser.email) throw new Error("self-conversation");
    const contactId = await directory.findByEmail(contactEmail);
    if (!contactId) throw new Error("user-not-found");
    const participants: ConversationParticipant[] = [
      { userID: currentUser.uid, email: currentUser.email, blockStatus: false, deleteStatus: false },
      { userID: contactId, email: contactEmail, blockStatus: false, deleteStatus: false },
    ];
    const id = await repository.create(participants);
    return { id, participants };
  },
});
