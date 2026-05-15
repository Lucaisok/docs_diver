"use server";
import { randomUUID } from "crypto";
import { mkdir, unlink, writeFile } from "fs/promises";
import path from "path";
import { revalidatePath } from "next/cache";
import { prisma } from "@/src/lib/prisma";
import { DEV_USER_ID } from "@/src/lib/dev-user";
import { SiteContent } from "@/src/lib/content";
import { Result } from "@/src/types/result";
import { parsePdfText } from "../documents/parse-pdf";
import { chunkText } from "../documents/chunk-text";
import { createEmbeddings } from "../ai/embeddings";

const deleteFileIfPresent = async (filePath: string | undefined) => {
    if (filePath) {
        try {
            await unlink(filePath);
        } catch (unlinkError) {
            console.error("Failed to clean up uploaded file after error", { filePath, unlinkError });
        }
    }
};

const createSafeFileName = (originalName: string) => {
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
const writeChunks = async ({ filePath, documentId, workspaceId }: { filePath: string, documentId: string, workspaceId: string; }): Promise<{ success: boolean; error: string | null; }> => {
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
                const vector = `[${embedding.join(",")}]`;

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

// Server action that handles the full document ingestion pipeline:
//   1. Validate the uploaded file (must be a non-empty PDF belonging to the current workspace)
//   2. Persist the file to disk under uploads/<workspaceId>/
//   3. Create a Document record with status PROCESSING
//   4. Parse, chunk, and embed the document via writeChunks
//   5. On success → mark the document INDEXED and revalidate the workspace page
//   6. On any failure → mark the document FAILED, store the error message, and
//      delete the uploaded file to avoid orphaned files on disk
export const uploadDocument = async (formData: FormData): Promise<Result<null>> => {
    const workspaceId = String(formData.get("workspaceId") || "");
    const file = formData.get("file");
    let filePath = "";
    let documentId: string | null = null;
    if (!workspaceId) {
        return {
            success: false,
            data: null,
            error: SiteContent.noWorkspaceIdError
        };
    }
    if (!(file instanceof File) || file.size === 0) {
        return {
            success: false,
            data: null,
            error: SiteContent.noPDFError
        };
    }
    if (file.type !== "application/pdf") {
        return {
            success: false,
            data: null,
            error: SiteContent.wrongFileTypeError
        };
    }

    try {
        const workspace = await prisma.workspace.findFirst({
            where: {
                id: workspaceId,
                userId: DEV_USER_ID,
            },
        });
        if (!workspace) {
            return {
                success: false,
                data: null,
                error: SiteContent.workspaceNotFoundError
            };
        }
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        const uploadDir = path.join(process.cwd(), "uploads", workspaceId);
        await mkdir(uploadDir, { recursive: true });

        const safeFileName = createSafeFileName(file.name);
        filePath = path.join(uploadDir, safeFileName);

        await writeFile(filePath, buffer);

        const document = await prisma.document.create({
            data: {
                workspaceId,
                userId: DEV_USER_ID,
                name: file.name,
                filePath,
                mimeType: file.type,
                status: "PROCESSING",
            },
        });
        documentId = document.id;

        const response = await writeChunks({ filePath, documentId: document.id, workspaceId: workspace.id });
        if (!response.success) {
            const uploadError = response.error ?? SiteContent.documentUploadError;

            await prisma.document.update({
                where: {
                    id: document.id,
                },
                data: {
                    status: "FAILED",
                    error: uploadError,
                },
            });

            await deleteFileIfPresent(filePath);
            return { success: false, data: null, error: uploadError };
        }

        await prisma.document.update({
            where: {
                id: document.id,
            },
            data: {
                status: "INDEXED",
                error: null,
            },
        });

        revalidatePath(`/workspaces/${workspaceId}`);
        return { success: true, data: null, error: null };

    } catch (error) {
        console.error("Failed to upload document", { workspaceId, error });

        if (documentId) {
            try {
                await prisma.document.update({
                    where: {
                        id: documentId,
                    },
                    data: {
                        status: "FAILED",
                        error: SiteContent.documentUploadError,
                    },
                });
            } catch (statusUpdateError) {
                console.error("Failed to set document status to FAILED", {
                    workspaceId,
                    documentId,
                    statusUpdateError,
                });
            }
        }

        await deleteFileIfPresent(filePath);
        return { success: false, data: null, error: SiteContent.documentUploadError };
    }
};