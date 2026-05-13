import { prisma } from "@/src/lib/prisma";

export const getWorkspacesByUserId = async (userId: string) => {
    return prisma.workspace.findMany({
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
};
