import { Citation } from "./message";

export interface AIRequestLogs {
    workspaceId: string;
    model: string;
    id: string;
    createdAt: Date;
    userId: string;
    question: string;
    answer: string;
    chunksRetrieved: number;
    retrievedChunks: Citation[];
    usedChunks: Citation[] | null;
    avgSimilarity: number | null;
    estimatedInputTokens: number | null;
    estimatedOutputTokens: number | null;
    latencyMs: number | null;
}  
