"use server";
import { SiteContent } from "@/src/lib/content";
import { prisma } from "@/src/lib/prisma";
import { Result } from "@/src/types/result";
import { revalidatePath } from "next/cache";
import { deleteFileIfPresent, removeWorkspaceUploadsDirectory } from "../utils/utils";
import { getCurrentUserId } from "../auth/session-user";

export async function deleteWorkspace(workspaceId: string): Promise<Result<null>> {
    try {
        const userId = await getCurrentUserId();
        const workspace = await prisma.workspace.findFirst({
            where: {
                id: workspaceId,
                userId: userId,
            },
        });

        if (!workspace) {
            console.error(SiteContent.workspaceNotFoundError);
            return { success: false, data: null, error: SiteContent.workspaceDeleteError };
        }

        const documents = await prisma.document.findMany({
            where: {
                workspaceId,
                userId: userId,
            },
            select: {
                filePath: true,
            },
        });

        await prisma.workspace.delete({
            where: {
                id: workspaceId,
            },
        });

        for (const document of documents) {
            await deleteFileIfPresent(document.filePath);
        }

        await removeWorkspaceUploadsDirectory(workspaceId);

        revalidatePath(`/workspaces/${workspaceId}`);
        return { success: true, data: null, error: null };

    } catch (error) {
        console.error("error deleting workspace", error);
        return { success: false, data: null, error: SiteContent.workspaceDeleteError };
    }
}