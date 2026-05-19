import { SiteContent } from "@/src/lib/content";
import { prisma } from "@/src/lib/prisma";
import { Result } from "@/src/types/result";
import { WorkspaceDetails, Workspaces, workspaceDetailsArgs, workspaceListItemArgs } from "@/src/types/workspace";

export type GetWorkspacesByUserIdResult = Result<Workspaces>;

export const getWorkspacesByUserId = async (userId: string): Promise<GetWorkspacesByUserIdResult> => {
    try {
        const workspaces = await prisma.workspace.findMany({
            where: {
                userId,
            },
            ...workspaceListItemArgs,
            orderBy: {
                updatedAt: "desc",
            },
        });

        return {
            success: true,
            data: workspaces,
            error: null,
        };
    } catch (error) {
        console.error("Failed to load workspaces", { userId, error });
        return {
            success: false,
            data: [],
            error: SiteContent.getWorkspacesError,
        };
    }
};


export type GetWorkspaceByIdResult = Result<WorkspaceDetails | null>;

export const getWorkspaceById = async (workspaceId: string, userId: string): Promise<GetWorkspaceByIdResult> => {
    try {
        const workspace = await prisma.workspace.findFirst({
            where: {
                id: workspaceId,
                userId,
            },
            ...workspaceDetailsArgs,
        });
        return {
            success: workspace !== null,
            data: workspace,
            error: workspace === null ? SiteContent.workspaceNotFoundError : null
        };
    } catch (error) {
        console.error("Failed to load workspace", { userId, workspaceId, error });
        return {
            success: false,
            data: null,
            error: SiteContent.getWorkspacesError,
        };
    }

};
