"use server";

import { mkdir, unlink, writeFile } from "fs/promises";
import path from "path";
import { revalidatePath } from "next/cache";
import { prisma } from "@/src/lib/prisma";
import { DEV_USER_ID } from "@/src/lib/dev-user";
import { SiteContent } from "@/src/lib/content";
import { Result } from "@/src/types/result";

export const uploadDocument = async (formData: FormData): Promise<Result<null>> => {
    const workspaceId = String(formData.get("workspaceId") || "");
    const file = formData.get("file");
    let filePath = "";
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

        const safeFileName = `${Date.now()}-${file.name.replaceAll(" ", "-")}`;
        filePath = path.join(uploadDir, safeFileName);

        await writeFile(filePath, buffer);

        await prisma.document.create({
            data: {
                workspaceId,
                userId: DEV_USER_ID,
                name: file.name,
                filePath,
                mimeType: file.type,
                status: "UPLOADED",
            },
        });

        revalidatePath(`/workspaces/${workspaceId}`);
        return { success: true, data: null, error: null };

    } catch (error) {
        console.error("Failed to upload document", { workspaceId, error });
        if (filePath) {
            try {
                await unlink(filePath);
            } catch (unlinkError) {
                console.error("Failed to clean up uploaded file after error", { filePath, unlinkError });
            }
        }
        return { success: false, data: null, error: SiteContent.documentUploadError };
    }
};