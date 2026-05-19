import { Prisma } from "@prisma/client";
export type { Result } from "@/src/types/result";

export const workspaceListItemArgs = Prisma.validator<Prisma.WorkspaceDefaultArgs>()({
    include: {
        _count: {
            select: {
                documents: true,
            },
        },
    },
});

export const workspaceDetailsArgs = Prisma.validator<Prisma.WorkspaceDefaultArgs>()({
    include: {
        documents: {
            orderBy: {
                createdAt: "desc",
            },
            include: {
                _count: {
                    select: {
                        chunks: true,
                    },
                },
            },
        },
        _count: {
            select: {
                documents: true,
            },
        },
    },
});

export type WorkspaceListItem = Prisma.WorkspaceGetPayload<typeof workspaceListItemArgs>;
export type WorkspaceDetails = Prisma.WorkspaceGetPayload<typeof workspaceDetailsArgs>;
export type WorkspaceDocument = WorkspaceDetails["documents"][number];
export type Workspaces = WorkspaceListItem[];
