"use server";
import { SiteContent } from "@/src/lib/content";
import { prisma } from "@/src/lib/prisma";
import { Result } from "@/src/types/result";
import { revalidatePath } from "next/cache";
import { deleteFileIfPresent, resolveUploadPath } from "../utils/utils";
import { getCurrentUserId } from "../auth/session-user";

export async function deleteDocument(documentId: string, workspaceId: string): Promise<Result<null>> {
    try {
        const userId = await getCurrentUserId();
        const document = await prisma.document.findFirst({
            where: {
                id: documentId,
                workspaceId,
                userId: userId,
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