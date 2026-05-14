"use server";
import { Prisma } from "@prisma/client";
import { DEV_USER_ID } from "@/src/lib/dev-user";
import { prisma } from "@/src/lib/prisma";
import { revalidatePath } from "next/cache";
import { SiteContent } from "@/src/lib/content";

export const createWorkspace = async (
    formData: FormData,
): Promise<{ success: boolean; error: string | null; }> => {
    const name = String(formData.get("name") || "").trim();

    if (!name) {
        return { success: false, error: SiteContent.workspaceNameRequired };
    }

    try {
        await prisma.workspace.create({
            data: {
                name,
                userId: DEV_USER_ID,
            },
        });
    } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
            if (error.code === "P2002") {
                return { success: false, error: SiteContent.workspaceNameExists };
            }
        }

        return { success: false, error: SiteContent.workspaceCreationError };
    }

    revalidatePath("/dashboard");
    return { success: true, error: null };
};