"use server";
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { revalidatePath } from "next/cache";
import { prisma } from "@/src/lib/prisma";
import { SiteContent } from "@/src/lib/content";
import { Result } from "@/src/types/result";
import { createSafeFileName, deleteFileIfPresent, writeChunks } from "../utils/utils";
import { getCurrentUserId } from "../auth/session-user";

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
        const userId = await getCurrentUserId();
        const workspace = await prisma.workspace.findFirst({
            where: {
                id: workspaceId,
                userId: userId,
            },
        });
        if (!workspace) {
            return {
                success: false,
                data: null,
                error: SiteContent.workspaceNotFoundError
            };
        }

        if (workspace.isDemo) {
            return {
                success: false,
                data: null,
                error: SiteContent.demoWorkspaceUploadBlockedError,
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
                userId: userId,
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