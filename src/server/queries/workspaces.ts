import { SiteContent } from "@/src/lib/content";
import { prisma } from "@/src/lib/prisma";
import { QueryResult, WorkspaceDetails, WorkspaceListItem } from "@/src/types/workspace";

export type Workspaces = WorkspaceListItem[];

export type GetWorkspacesByUserIdResult = QueryResult<Workspaces>;

export const getWorkspacesByUserId = async (userId: string): Promise<GetWorkspacesByUserIdResult> => {
    if (!userId) {
        return {
            success: false,
            data: [],
            error: SiteContent.noUserIdError,
        };
    }

    try {
        const workspaces = await prisma.workspace.findMany({
            where: {
                userId,
            },
            include: {
                _count: {
                    select: {
                        documents: true,
                    },
                },
            },
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


export type WorkspaceWithDocuments = WorkspaceDetails;

export type GetWorkspaceByIdResult = QueryResult<WorkspaceWithDocuments | null>;

export const getWorkspaceById = async (workspaceId: string, userId: string): Promise<GetWorkspaceByIdResult> => {
    if (!userId) {
        return {
            success: false,
            data: null,
            error: SiteContent.noUserIdError,
        };
    }
    if (!workspaceId) {
        return {
            success: false,
            data: null,
            error: SiteContent.noWorkspaceIdError,
        };
    }
    try {
        const workspace = await prisma.workspace.findFirst({
            where: {
                id: workspaceId,
                userId,
            },
            include: {
                documents: {
                    orderBy: {
                        createdAt: "desc",
                    },
                },
                _count: {
                    select: {
                        documents: true,
                        chats: true,
                    },
                },
            },
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
