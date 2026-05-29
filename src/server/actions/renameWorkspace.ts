"use server";

import { Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { SiteContent } from "@/src/lib/content";
import { DEV_USER_ID } from "@/src/lib/dev-user";
import { prisma } from "@/src/lib/prisma";
import { Result } from "@/src/types/result";

export async function renameWorkspace(workspaceId: string, name: string): Promise<Result<null>> {
    const trimmedName = name.trim();

    if (!workspaceId) {
        return { success: false, data: null, error: SiteContent.noWorkspaceIdError };
    }

    if (!trimmedName) {
        return { success: false, data: null, error: SiteContent.workspaceNameRequired };
    }

    try {
        const workspace = await prisma.workspace.findFirst({
            where: {
                id: workspaceId,
                userId: DEV_USER_ID,
            },
            select: {
                id: true,
            },
        });

        if (!workspace) {
            return { success: false, data: null, error: SiteContent.workspaceNotFoundError };
        }

        await prisma.workspace.update({
            where: {
                id: workspace.id,
            },
            data: {
                name: trimmedName,
            },
        });

        revalidatePath("/dashboard");
        revalidatePath(`/workspaces/${workspaceId}`);

        return { success: true, data: null, error: null };
    } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
            return { success: false, data: null, error: SiteContent.workspaceNameExists };
        }

        return { success: false, data: null, error: SiteContent.workspaceRenameError };
    }
}
