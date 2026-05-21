import { parsePdfText } from "../documents/parse-pdf";
import { chunkText } from "../documents/chunk-text";
import { createEmbeddings } from "../ai/embeddings";
import { randomUUID } from "crypto";
import { rm, unlink } from "fs/promises";
import path from "path";
import { SiteContent } from "@/src/lib/content";
import { prisma } from "@/src/lib/prisma";
import { DEV_USER_ID } from "@/src/lib/dev-user";
import { RetrievedChunk, retrieveRelevantChunks } from "../ai/retrieval";
import { Citation } from "@/src/types/message";
import { Prisma } from "@prisma/client";

export const getVectorFromEmbedding = (embedding: number[]) => `[${embedding.join(",")}]`;

const getUploadsRootPath = () => path.resolve(process.cwd(), "uploads");

export const resolveUploadPath = (filePath: string) => path.isAbsolute(filePath)
    ? path.resolve(filePath)
    : path.resolve(process.cwd(), filePath);

const isWithinUploadsRoot = (targetPath: string) => {
    const uploadsRoot = getUploadsRootPath();
    const relativeTargetPath = path.relative(uploadsRoot, targetPath);

    return relativeTargetPath !== "" && !relativeTargetPath.startsWith("..") && !path.isAbsolute(relativeTargetPath);
};

export const removeWorkspaceUploadsDirectory = async (workspaceId: string) => {
    if (!workspaceId) {
        return;
    }

    const workspaceUploadsPath = path.resolve(getUploadsRootPath(), workspaceId);

    if (!isWithinUploadsRoot(workspaceUploadsPath)) {
        return;
    }

    try {
        await rm(workspaceUploadsPath, { recursive: true, force: true });
    } catch (error) {
        console.error("Failed to remove workspace uploads directory", { workspaceId, error });
    }
};

export const deleteFileIfPresent = async (filePath: string | undefined) => {
    if (filePath) {
        try {
            await unlink(resolveUploadPath(filePath));
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
- Be concise and precise. Avoid speculation or external knowledge.
- If sources conflict, mention both perspectives and cite each.`;

/**
 * Extract text content from a UIMessage
 * UIMessage has a parts array with text parts
 */
export const extractMessageText = (message: any | undefined): string => {
    if (!message) return "";

    // Handle string content (from useChat)
    if (typeof message.content === "string") {
        return message.content;
    }

    // Handle parts array structure (from DB conversion)
    if (message.parts && Array.isArray(message.parts)) {
        return message.parts
            .filter((part: any) => part.type === "text")
            .map((part: any) => part.text)
            .join("\n")
            .trim();
    }

    return "";
};

type ParsedChatRequest =
    | { ok: true; data: { messages: unknown[]; workspaceId: string; }; }
    | { ok: false; response: Response; };
export const parseAndValidateRequest = async (req: Request): Promise<ParsedChatRequest> => {
    try {
        const body = await req.json();
        const { messages, workspaceId } = body;

        if (!workspaceId || typeof workspaceId !== "string") {
            return {
                ok: false,
                response: new Response(
                    JSON.stringify({ error: SiteContent.invalidWorkspaceIdError }),
                    { status: 400 },
                ),
            };
        }
        if (!Array.isArray(messages) || messages.length === 0) {
            return {
                ok: false,
                response: new Response(JSON.stringify({ error: SiteContent.invalidMessagesArrayError }), {
                    status: 400,
                })
            };
        }

        return { data: { messages, workspaceId }, ok: true };

    } catch (error) {
        console.error("Chat API error:", error);
        return {
            ok: false,
            response: new Response(
                JSON.stringify({
                    error: error instanceof Error ? error.message : SiteContent.internalServerError,
                }),
                { status: 500 }
            )
        };
    }
};

type WorkspaceAccessResult =
    | { ok: true; }
    | { ok: false; response: Response; };

export const assertWorkspaceAccess = async (workspaceId: string): Promise<WorkspaceAccessResult> => {
    try {
        const workspace = await prisma.workspace.findUnique({
            where: { id: workspaceId },
        });

        if (!workspace || workspace.userId !== DEV_USER_ID) {
            return {
                ok: false,
                response: new Response(JSON.stringify({ error: SiteContent.workspaceUnauthorizedError }), {
                    status: 404,
                })
            };
        }

        return { ok: true };
    } catch (error) {
        console.error("Chat API error:", error);
        return {
            ok: false,
            response: new Response(
                JSON.stringify({
                    error: error instanceof Error ? error.message : SiteContent.internalServerError,
                }),
                { status: 500 }
            )
        };
    }
};

type GetLastMessageContentResult =
    | { ok: true; data: { messageContent: string; }; }
    | { ok: false; response: Response; };

export const getLastMessageContent = (messages: unknown[]): GetLastMessageContentResult => {
    const lastUserMessage = messages[messages.length - 1] as any;
    const messageContent = extractMessageText(lastUserMessage);
    if (!messageContent) {
        console.error("Failed to extract message content from:", lastUserMessage);
        return {
            ok: false,
            response: new Response(JSON.stringify({ error: SiteContent.invalidMessageContentError }), {
                status: 400,
            })
        };
    }
    return { ok: true, data: { messageContent } };
};

type SaveUserMessageResult =
    | { ok: true; }
    | { ok: false; response: Response; };

export const saveUserMessage = async (workspaceId: string, messageContent: string): Promise<SaveUserMessageResult> => {
    try {
        await prisma.message.create({
            data: {
                workspaceId,
                userId: DEV_USER_ID,
                role: "USER",
                content: messageContent,
            },
        });
        return { ok: true };
    } catch (error) {
        console.error("Failed to save user message:", error);
        return {
            ok: false, response: new Response(JSON.stringify({ error: SiteContent.saveMessageError }), {
                status: 500,
            })
        };
    }
};

export const getChunks = async (workspaceId: string, messageContent: string) => {
    let chunks: RetrievedChunk[] = [];
    try {
        chunks = await retrieveRelevantChunks({
            workspaceId,
            query: messageContent,
            limit: 6,
            minSimilarity: 0.35,
        });
    } catch (error) {
        console.error("Failed to retrieve relevant chunks:", error);
        // Continue without context rather than failing
    } finally {
        return chunks;
    }
};

type SelectChunksOptions = {
    maxContextTokens?: number;
    minSimilarity?: number;
    maxChunks?: number;
};

export const selectBestChunks = (
    chunks: RetrievedChunk[],
    {
        maxContextTokens = 3000,
        minSimilarity = 0.35,
        maxChunks = 6,
    }: SelectChunksOptions = {}
): RetrievedChunk[] => {
    const selectedChunks: RetrievedChunk[] = [];
    let totalTokens = 0;

    for (const chunk of chunks) {
        if (chunk.similarity < minSimilarity) continue;

        const tokenCount =
            chunk.tokenCount ?? Math.ceil(chunk.content.length / 4);

        if (totalTokens + tokenCount > maxContextTokens) continue;

        selectedChunks.push(chunk);
        totalTokens += tokenCount;

        if (selectedChunks.length >= maxChunks) break;
    }

    return selectedChunks;
};

export const buildMessageAndHistory = (chunks: RetrievedChunk[], messages: unknown[], messageContent: string) => {
    const context = chunks
        .map(
            (chunk, index) => `[Source ${index + 1}] Document: ${chunk.documentName} Chunk: ${chunk.chunkIndex} Content: ${chunk.content}`
        )
        .join("\n\n");

    // Build messages for LLM - use convertToModelMessages to properly format history
    const modelMessages = messages.slice(-6).map((msg: any) => ({
        role: msg.role,
        content: extractMessageText(msg),
    }));

    // Build the user message with context
    const userMessageContent = `Context: ${context || "No relevant context found."} Question: ${messageContent}`.trim();

    const estimatedInputTokens = Math.ceil(
        (
            context.length +
            messageContent.length
        ) / 4
    );

    return { history: modelMessages, messageWithContext: userMessageContent, estimatedInputTokens };
};

export const buildCitations = (chunks: RetrievedChunk[]): Citation[] => (chunks.map((chunk, index) => ({
    sourceNumber: index + 1,
    documentId: chunk.documentId,
    documentName: chunk.documentName,
    chunkIndex: chunk.chunkIndex,
    excerpt: chunk.content.slice(0, 300),
    similarity: chunk.similarity,
})));

export const filterUsedCitations = (answerText: string, citations: Citation[]): Citation[] => {
    if (!answerText || citations.length === 0) {
        return [];
    }

    const usedSourceNumbersInOrder: number[] = [];
    const seen = new Set<number>();
    const sourcePattern = /\[\s*source\s+(\d+)\s*\]/gi;

    for (const match of answerText.matchAll(sourcePattern)) {
        const sourceNumber = Number(match[1]);

        if (!Number.isInteger(sourceNumber) || seen.has(sourceNumber)) {
            continue;
        }

        seen.add(sourceNumber);
        usedSourceNumbersInOrder.push(sourceNumber);
    }

    if (usedSourceNumbersInOrder.length === 0) {
        return [];
    }

    return usedSourceNumbersInOrder
        .map((sourceNumber) => citations.find((citation) => citation.sourceNumber === sourceNumber))
        .filter((citation): citation is Citation => citation !== undefined);
};

export const saveModelAnswer = async (workspaceId: string, text: string, citations: Citation[]) => {
    try {
        await prisma.message.create({
            data: {
                workspaceId,
                userId: DEV_USER_ID,
                role: "ASSISTANT",
                content: text,
                citations
            },
        });
    } catch (error) {
        console.error("Failed to save assistant message:", error);
        // Note: Can't send error to client here as stream already started
    }
};

export const saveAIRequestLog = async (selectedChunks: Citation[], usedChunks: Citation[], workspaceId: string, messageContent: string, estimatedInputTokens: number, streamedText: string, startedAt: number, model: string = "gpt-4o-mini") => {
    const avgSimilarity =
        selectedChunks.length > 0
            ? selectedChunks.reduce(
                (sum, chunk) => sum + chunk.similarity,
                0
            ) / selectedChunks.length
            : null;

    await prisma.aIRequestLog.create({
        data: {
            workspaceId,
            userId: DEV_USER_ID,
            question: messageContent,
            answer: streamedText,
            model: model,
            chunksRetrieved: selectedChunks.length,
            retrievedChunks: selectedChunks,
            usedChunks,
            avgSimilarity,
            estimatedInputTokens,
            estimatedOutputTokens: Math.ceil(streamedText.length / 4),
            latencyMs: Date.now() - startedAt,
        },
    });
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

export const parseCitations = (value: Prisma.JsonValue | null | undefined): Citation[] => {
    if (!Array.isArray(value)) return [];

    return value.filter(isCitation);
};