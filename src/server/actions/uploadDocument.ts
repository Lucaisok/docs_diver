"use server";
import { mkdir, unlink, writeFile } from "fs/promises";
import path from "path";
import { revalidatePath } from "next/cache";
import { prisma } from "@/src/lib/prisma";
import { DEV_USER_ID } from "@/src/lib/dev-user";
import { SiteContent } from "@/src/lib/content";
import { Result } from "@/src/types/result";
import { parsePdfText } from "../documents/parse-pdf";
import { chunkText } from "../documents/chunk-text";

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

const writeChunks = async ({ filePath, documentId, workspaceId }: { filePath: string, documentId: string, workspaceId: string; }): Promise<{ success: boolean; error: string | null; }> => {
    try {
        const { text } = await parsePdfText(filePath);
        const chunks = chunkText(text, {
            maxChars: 3000,
            overlapChars: 300,
        });
        if (chunks.length === 0) {
            // for ex. if its a screenshot, so delete file here
            return { success: false, error: SiteContent.textExtractionError };
        }
        await prisma.documentChunk.createMany({
            data: chunks.map((chunk, index) => ({
                documentId: documentId,
                workspaceId,
                content: chunk,
                chunkIndex: index,
                tokenCount: Math.ceil(chunk.length / 4),
            })),
        });
        return { success: true, error: null };

    } catch (error) {
        console.error("Failed to write chunks", { workspaceId, error });
        return { success: false, error: SiteContent.documentUploadError };
    }
};

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