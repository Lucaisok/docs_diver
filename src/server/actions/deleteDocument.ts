"use server";
import { SiteContent } from "@/src/lib/content";
import { DEV_USER_ID } from "@/src/lib/dev-user";
import { prisma } from "@/src/lib/prisma";
import { Result } from "@/src/types/result";
import { revalidatePath } from "next/cache";
import path from "node:path";
import { deleteFileIfPresent, resolveUploadPath } from "../utils/utils";

export async function deleteDocument(documentId: string, workspaceId: string): Promise<Result<null>> {
    try {
        const document = await prisma.document.findFirst({
            where: {
                id: documentId,
                workspaceId,
                userId: DEV_USER_ID,
            },
        });

        if (!document) {
            console.error(SiteContent.documentNotFoundError);
            return { success: false, data: null, error: SiteContent.documentDeleteError };
        }

        await prisma.document.delete({
            where: {
                id: document.id,
            },
        });

        const filePath = resolveUploadPath(document.filePath);

        await deleteFileIfPresent(filePath);

        revalidatePath(`/workspaces/${workspaceId}`);
        return { success: true, data: null, error: null };

    } catch (error) {
        console.error("error deleting document", error);

        return { success: false, data: null, error: SiteContent.documentDeleteError };

    }
}