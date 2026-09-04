import { MessageStatus } from "src/types";

export const MESSAGE_STATUS: Record<string, MessageStatus> = {
    SENT: "SENT",
    DELIVERED: "DELIVERED",
    SEEN: "SEEN",
}