import { UIDataTypes, UIMessage, UITools } from "ai";
import { ChatMessageMetadata, InitialMessage, parseCitations } from "../types/message";
import { AIRequestLogs } from "../types/aiReqLogs";

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

interface RequestLogs {
    workspaceId: string;
    model: string;
    id: string;
    createdAt: Date;
    userId: string;
    question: string;
    answer: string;
    chunksRetrieved: number;
    retrievedChunks: unknown;
    usedChunks: unknown | null;
    avgSimilarity: number | null;
    estimatedInputTokens: number | null;
    estimatedOutputTokens: number | null;
    latencyMs: number | null;
}

export const getFormattedAILogs = (requestLogs: RequestLogs | null): AIRequestLogs | null => {
    return requestLogs
        ? {
            id: requestLogs.id,
            workspaceId: requestLogs.workspaceId,
            userId: requestLogs.userId,
            model: requestLogs.model,
            question: requestLogs.question,
            answer: requestLogs.answer,
            createdAt: requestLogs.createdAt,
            chunksRetrieved: requestLogs.chunksRetrieved,
            retrievedChunks: parseCitations(requestLogs.retrievedChunks as never),
            usedChunks:
                requestLogs.usedChunks === null
                    ? null
                    : parseCitations(requestLogs.usedChunks as never),
            avgSimilarity: requestLogs.avgSimilarity,
            estimatedInputTokens: requestLogs.estimatedInputTokens,
            estimatedOutputTokens: requestLogs.estimatedOutputTokens,
            latencyMs: requestLogs.latencyMs,
        }
        : null;
};