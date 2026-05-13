"use server";
import { Prisma } from "@prisma/client";
import { DEV_USER_ID } from "@/src/lib/dev-user";
import { prisma } from "@/src/lib/prisma";
import { revalidatePath } from "next/cache";

export const createWorkspace = async (
    formData: FormData,
) => {
    const name = String(formData.get("name") || "").trim();

    if (!name) {
        throw new Error("Workspace name is required");
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
                throw new Error("A workspace with this name already exists");
            }
        }

        throw new Error("Unable to create workspace right now. Please try again.");
    }

    revalidatePath("/dashboard");
};