"use server";
import { SiteContent } from "@/src/lib/content";
import { DEV_USER_ID } from "@/src/lib/dev-user";
import { prisma } from "@/src/lib/prisma";

export const createChat = async (workspaceId: string): Promise<{ error: string | null; success: boolean; chatId: string | null; }> => {

    try {
        const chat = await prisma.chat.upsert({
            where: {
                workspaceId,
            },
            update: {
                updatedAt: new Date(),
            },
            create: {
                workspaceId,
                userId: DEV_USER_ID,
                title: "New chat",
            },
        });
        return { success: true, error: null, chatId: chat.id };

    } catch (error) {
        console.error("error creating chat: ", error);
        return { success: false, error: SiteContent.chatCreationError, chatId: null };
    }
};