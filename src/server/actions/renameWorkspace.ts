"use server";

import { Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { SiteContent } from "@/src/lib/content";
import { prisma } from "@/src/lib/prisma";
import { Result } from "@/src/types/result";
import { getCurrentUserId } from "../auth/session-user";

export const renameWorkspace = async (workspaceId: string, name: string): Promise<Result<null>> => {
    const trimmedName = name.trim();

    if (!workspaceId) {
        return { success: false, data: null, error: SiteContent.noWorkspaceIdError };
    }

    if (!trimmedName) {
        return { success: false, data: null, error: SiteContent.workspaceNameRequired };
    }

    try {
        const userId = await getCurrentUserId();
        const workspace = await prisma.workspace.findFirst({
            where: {
                id: workspaceId,
                userId: userId,
            },
            select: {
                id: true,
                isDemo: true,
            },
        });

        if (!workspace) {
            return { success: false, data: null, error: SiteContent.workspaceNotFoundError };
        }

        if (workspace.isDemo) {
            return { success: false, data: null, error: SiteContent.demoWorkspaceLockedError };
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
};
