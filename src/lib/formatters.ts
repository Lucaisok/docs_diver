import { UIDataTypes, UIMessage, UITools } from "ai";
import { ChatMessageMetadata, Citation, InitialMessage } from "../types/message";

const getTextParts = (message: UIMessage<ChatMessageMetadata> | InitialMessage): { type: "text"; text: string; }[] => {
    const parts = Array.isArray(message.parts) ? message.parts : [];

    const textParts = parts
        .filter(
            (part): part is { type: "text"; text: string; } =>
                part.type === "text" && "text" in part && typeof (part as { text?: unknown; }).text === "string",
        )
        .map((part) => ({ type: "text" as const, text: part.text }));

    return textParts;
};

export const getFormattedMessages = (displayMessages: (InitialMessage | UIMessage<ChatMessageMetadata, UIDataTypes, UITools>)[]): InitialMessage[] => {
    return displayMessages.map((message) => {
        const metadataCitations =
            "metadata" in message &&
                message.metadata &&
                Array.isArray(message.metadata.citations)
                ? message.metadata.citations
                : [];

        const mappedCitations =
            "citations" in message && Array.isArray(message.citations)
                ? message.citations
                : metadataCitations;

        return {
            id: message.id,
            role: message.role,
            parts: getTextParts(message),
            citations: mappedCitations,
        };
    });
}; 