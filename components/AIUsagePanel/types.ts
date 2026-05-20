export type RetrievedChunkLog = {
    sourceNumber: number;
    documentName: string;
    chunkIndex: number;
    similarity: number;
    excerpt: string;
};

export type AIUsagePanelLog = {
    question: string;
    answer: string;
    model: string;
    retrievedChunks: RetrievedChunkLog[] | null;
    usedChunks: RetrievedChunkLog[] | null;
    avgSimilarity: number | null;
    estimatedInputTokens: number | null;
    estimatedOutputTokens: number | null;
    latencyMs: number | null;
    createdAt: Date;
};
