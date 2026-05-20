export type Citation = {
    sourceNumber: number;
    documentId: string;
    documentName: string;
    chunkIndex: number;
    excerpt: string;
    similarity: number;
};

export type InitialMessage = {
    id: string;
    role: "system" | "user" | "assistant";
    parts: {
        type: "text";
        text: string;
    }[];
    citations?: Citation[];
};

export type ChatMessageMetadata = {
    citations?: Citation[];
};

const isCitation = (value: unknown): value is Citation => {
    if (!value || typeof value !== "object") return false;

    const citation = value as Record<string, unknown>;

    return (
        typeof citation.sourceNumber === "number" &&
        typeof citation.documentId === "string" &&
        typeof citation.documentName === "string" &&
        typeof citation.chunkIndex === "number" &&
        typeof citation.excerpt === "string" &&
        typeof citation.similarity === "number"
    );
};

export const parseCitations = (value: unknown): Citation[] => {
    if (!Array.isArray(value)) return [];

    return value.filter(isCitation);
};
