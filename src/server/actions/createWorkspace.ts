"use server";
import { Prisma } from "@prisma/client";
import { DEV_USER_ID } from "@/src/lib/dev-user";
import { prisma } from "@/src/lib/prisma";
import { SiteContent } from "@/src/lib/content";
import { revalidatePath } from "next/cache";
import { routes } from "@/src/lib/routes";

export const createWorkspace = async (
    formData: FormData,
): Promise<{ success: boolean; error: string | null; workspaceId: string | null; chatId: string | null; }> => {
    const name = String(formData.get("name") || "").trim();

    if (!name) {
        return { success: false, error: SiteContent.workspaceNameRequired, workspaceId: null, chatId: null };
    }

    try {
        const result = await prisma.$transaction(async (tx) => {
            const workspace = await tx.workspace.create({
                data: {
                    name,
                    userId: DEV_USER_ID,
                },
            });

            const chat = await tx.chat.create({
                data: {
                    workspaceId: workspace.id,
                    userId: DEV_USER_ID,
                    title: "New chat",
                },
            });
            return { workspaceId: workspace.id, chatId: chat.id };
        });

        revalidatePath(routes.dashboard);
        return { success: true, error: null, workspaceId: result.workspaceId, chatId: result.chatId };

    } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
            if (error.code === "P2002") {
                return { success: false, error: SiteContent.workspaceNameExists, workspaceId: null, chatId: null };
            }
        }

        return { success: false, error: SiteContent.workspaceCreationError, workspaceId: null, chatId: null };
    }
};