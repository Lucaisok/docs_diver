import { Prisma } from "@prisma/client";
export type { Result } from "@/src/types/result";

export type WorkspaceListItem = Prisma.WorkspaceGetPayload<{
    include: {
        _count: {
            select: {
                documents: true;
            };
        };
    };
}>;

export type WorkspaceDocument = Prisma.DocumentGetPayload<Record<string, never>>;

export type WorkspaceDetails = Prisma.WorkspaceGetPayload<{
    include: {
        documents: true;
        _count: {
            select: {
                documents: true;
                chats: true;
            };
        };
    };
}>;
