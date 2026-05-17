import { parsePdfText } from "../documents/parse-pdf";
import { chunkText } from "../documents/chunk-text";
import { createEmbeddings } from "../ai/embeddings";
import { randomUUID } from "crypto";
import { unlink } from "fs/promises";
import path from "path";
import { SiteContent } from "@/src/lib/content";
import { prisma } from "@/src/lib/prisma";

export const getVectorFromEmbedding = (embedding: number[]) => `[${embedding.join(",")}]`;

export const deleteFileIfPresent = async (filePath: string | undefined) => {
    if (filePath) {
        try {
            await unlink(filePath);
        } catch (unlinkError) {
            console.error("Failed to clean up uploaded file after error", { filePath, unlinkError });
        }
    }
};

export const createSafeFileName = (originalName: string) => {
    const fileExtension = path.extname(originalName).toLowerCase();
    const rawBaseName = path.basename(originalName, fileExtension);
    const sanitizedBaseName = rawBaseName
        .replace(/[^a-zA-Z0-9-_]/g, "-")
        .replace(/-+/g, "-")
        .replace(/^-|-$/g, "");

    const baseName = sanitizedBaseName || "document";
    const extension = fileExtension || ".pdf";

    return `${Date.now()}-${baseName}${extension}`;
};

// Parses the PDF at filePath, splits the extracted text into overlapping chunks,
// generates an embedding vector for each chunk, then inserts all chunks into the
// DocumentChunk table in a single transaction.
//
// Chunking strategy: 3000-character windows with 300-character overlap so that
// context around chunk boundaries is not lost during retrieval.
//
// The embedding column is a pgvector `vector(1536)` type. Prisma does not
// support custom column types natively, so we bypass the ORM and use a raw
// INSERT with the `::vector` cast for each row.
//
// The entire batch is wrapped in a transaction — if any single INSERT fails
// (e.g. wrong embedding dimensions) all chunks are rolled back, keeping the
// document in a consistent state before the caller sets its status to FAILED.
export const writeChunks = async ({ filePath, documentId, workspaceId }: { filePath: string, documentId: string, workspaceId: string; }): Promise<{ success: boolean; error: string | null; }> => {
    try {
        const { text } = await parsePdfText(filePath);
        const chunks = chunkText(text, {
            maxChars: 3000,
            overlapChars: 300,
        });
        if (chunks.length === 0) {
            // Happens when the PDF contains only images with no extractable text (e.g. scanned pages)
            return { success: false, error: SiteContent.textExtractionError };
        }

        const embeddings = await createEmbeddings(chunks);

        // Sanity check: the API must return exactly one embedding per input chunk
        if (embeddings.length !== chunks.length) {
            console.error("Embedding/chunk count mismatch", {
                workspaceId,
                chunks: chunks.length,
                embeddings: embeddings.length,
            });
            return { success: false, error: SiteContent.documentUploadError };
        }

        // text-embedding-3-small always returns 1536-dimensional vectors
        const expectedDimensions = 1536;

        await prisma.$transaction(async (tx) => {
            for (const [index, chunk] of chunks.entries()) {
                const embedding = embeddings[index];

                if (embedding.length !== expectedDimensions) {
                    throw new Error(`Invalid embedding dimensions: expected ${expectedDimensions}, got ${embedding.length}`);
                }

                // Format the array as a pgvector literal so Postgres can cast it with ::vector
                const vector = getVectorFromEmbedding(embedding);

                await tx.$executeRaw`
                    INSERT INTO "DocumentChunk"
                    (
                        id,
                        "documentId",
                        "workspaceId",
                        content,
                        "chunkIndex",
                        "tokenCount",
                        embedding,
                        "createdAt"
                    )
                    VALUES
                    (
                        ${randomUUID()},
                        ${documentId},
                        ${workspaceId},
                        ${chunk},
                        ${index},
                        ${Math.ceil(chunk.length / 4)},
                        ${vector}::vector,
                        NOW()
                    )
                `;
            }
        });

        return { success: true, error: null };

    } catch (error) {
        console.error("Failed to write chunks", { workspaceId, error });
        return { success: false, error: SiteContent.documentUploadError };
    }
};

export const truncateContext = (context: string, maxTokens: number): string => {
    const tokenBudget = Math.ceil(maxTokens * 4);
    if (context.length <= tokenBudget) return context;

    // Preserve source headers and truncate from the end
    const lines = context.split("\n");
    let accumulated = "";
    for (const line of lines) {
        if ((accumulated + line).length > tokenBudget) break;
        accumulated += line + "\n";
    }
    return accumulated + "\n[...content truncated due to length...]";
};

export const systemPrompt = `You are a technical knowledge assistant. Your goal is to answer questions accurately using ONLY the provided context.

CRITICAL RULES:
- If the answer is not in the context, explicitly state: "I cannot determine this from the uploaded documents."
- Always cite your sources using exact format: [Source N] where N is the source number.
- Be concise and precise. Avoid speculation or external knowledge.
- If sources conflict, mention both perspectives and cite each.`;