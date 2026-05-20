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
