import { Prisma } from "@prisma/client";
import { prisma } from "@/src/lib/prisma";
import { createEmbedding } from "./embeddings";
import { getVectorFromEmbedding } from "../utils/utils";

export type RetrievedChunk = {
    id: string;
    documentId: string;
    documentName: string;
    content: string;
    chunkIndex: number;
    similarity: number;
    tokenCount: number | null;
};

export async function retrieveRelevantChunks({
    workspaceId,
    query,
    limit = 6,
    minSimilarity = 0.35,
}: {
    workspaceId: string;
    query: string;
    limit?: number;
    minSimilarity?: number;
}): Promise<RetrievedChunk[]> {
    try {
        const trimmedQuery = query.trim();
        if (!trimmedQuery) {
            return [];
        }

        const safeLimit = Math.min(Math.max(limit, 1), 20);
        const safeMinSimilarity = Math.min(Math.max(minSimilarity, -1), 1);

        const embedding = await createEmbedding(trimmedQuery);
        const vector = getVectorFromEmbedding(embedding);

        // `scored` computes vector distance once for each candidate chunk in the workspace
        // (only from INDEXED documents), then the outer query converts distance to a
        // similarity score (`1 - distance`), applies a minimum threshold, and returns
        // the nearest chunks first.
        const chunks = await prisma.$queryRaw<RetrievedChunk[]>(Prisma.sql`
            WITH scored AS (
                SELECT
                    c.id,
                    c."documentId",
                    d.name AS "documentName",
                    c.content,
                    c."chunkIndex",
                    c."tokenCount",
                    (c.embedding <=> ${vector}::vector) AS distance
                FROM "DocumentChunk" c
                JOIN "Document" d ON d.id = c."documentId"
                WHERE c."workspaceId" = ${workspaceId}
                    AND c.embedding IS NOT NULL
                    AND d.status = 'INDEXED'
            )
            SELECT
                id,
                "documentId",
                "documentName",
                content,
                "chunkIndex",
                "tokenCount",
                1 - distance AS similarity
            FROM scored
            WHERE 1 - distance >= ${safeMinSimilarity}
            ORDER BY distance ASC
            LIMIT ${safeLimit}
        `);

        return chunks;
    } catch (error) {
        console.error("Failed to retrieve relevant chunks", { workspaceId, query, error });
        return [];
    }
}