import { createConversationUseCases } from "src/application/conversations/conversationUseCases";
import { createMessageUseCases } from "src/application/conversations/messageUseCases";
import { ConversationSubscriptionCoordinator } from "src/application/conversations/ConversationSubscriptionCoordinator";
import { ConversationRepository } from "src/domain/conversations/ConversationRepository";
import { UserDirectoryRepository } from "src/domain/identity/UserDirectoryRepository";
import { ProfileRepository } from "src/domain/profiles/ProfileRepository";
import { cloudFunctions, db, storage } from "src/Firebase/chat";
import { CallableUserDirectoryRepository } from "src/infrastructure/firebase/CallableUserDirectoryRepository";
import { FirestoreConversationRepository } from "src/infrastructure/firebase/FirestoreConversationRepository";
import { FirebaseProfileRepository } from "src/infrastructure/firebase/FirebaseProfileRepository";
import { InMemoryConversationRepository } from "src/infrastructure/testing/InMemoryConversationRepository";
import { InMemoryProfileRepository } from "src/infrastructure/testing/InMemoryProfileRepository";
import { InMemoryUserDirectoryRepository } from "src/infrastructure/testing/InMemoryUserDirectoryRepository";

type ChatServices = {
  conversations: ConversationRepository;
  profiles: ProfileRepository;
  userDirectory: UserDirectoryRepository;
};

const services: ChatServices = import.meta.env.VITE_E2E === "true"
  ? {
      conversations: new InMemoryConversationRepository(),
      profiles: new InMemoryProfileRepository(),
      userDirectory: new InMemoryUserDirectoryRepository(),
    }
  : {
      conversations: new FirestoreConversationRepository(db),
      profiles: new FirebaseProfileRepository(storage),
      userDirectory: new CallableUserDirectoryRepository(cloudFunctions),
    };

export const chatServices = services;
export const messageUseCases = createMessageUseCases(services.conversations);
export const conversationUseCases = createConversationUseCases(services.conversations, services.userDirectory);
export const conversationSubscriptions = new ConversationSubscriptionCoordinator(services.conversations);
