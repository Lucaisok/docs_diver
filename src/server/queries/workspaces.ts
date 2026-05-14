import { SiteContent } from "@/src/lib/content";
import { prisma } from "@/src/lib/prisma";

export interface GetWorkspacesByUserIdResult {
    success: boolean;
    data: Array<{
        id: string;
        name: string;
        updatedAt: Date;
        _count: {
            documents: number;
        };
    }>;
    error: string | null;
}

export const getWorkspacesByUserId = async (userId: string): Promise<GetWorkspacesByUserIdResult> => {
    if (!userId.trim()) {
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
