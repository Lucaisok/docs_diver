import { prisma } from "@/src/lib/prisma";
import { SiteContent } from "@/src/lib/content";
import { Result } from "@/src/types/result";
import { Message } from "@prisma/client";

export type GetMessagesByWorkspaceResult = Result<Message[]>;

export async function getMessagesByWorkspace(
    workspaceId: string,
    userId: string
): Promise<GetMessagesByWorkspaceResult> {
    try {
        const messages = await prisma.message.findMany({
            where: {
                workspaceId,
                userId,
            },
            orderBy: {
                createdAt: "asc",
            },
        });

        return {
            success: true,
            data: messages,
            error: null,
        };
    } catch (error) {
        console.error("Failed to load messages", { workspaceId, userId, error });
        return {
            success: false,
            data: [],
            error: SiteContent.getChatsError,
        };
    }
}