import { Conversation } from "src/domain/conversations/Conversation";
import { ConversationRepository } from "src/domain/conversations/ConversationRepository";
import { UserId } from "src/domain/identity/User";

export class ConversationSubscriptionCoordinator {
  private unsubscribe: (() => void) | null = null;
  constructor(private readonly repository: ConversationRepository) {}

  start = (userId: UserId, observer: (items: Conversation[]) => void) => {
    this.stop();
    this.unsubscribe = this.repository.watchForUser(userId, observer);
    return this.stop;
  };

  stop = () => {
    this.unsubscribe?.();
    this.unsubscribe = null;
  };
}
