"use server";

import { prisma } from "@/src/lib/prisma";
import { getFormattedAILogs } from "@/src/lib/formatters";
import { AIRequestLogs } from "@/src/types/aiReqLogs";

export async function getLatestAIRequestLog(
    workspaceId: string,
    userId: string
) {
    return prisma.aIRequestLog.findFirst({
        where: {
            workspaceId,
            userId,
        },
        orderBy: {
            createdAt: "desc",
        },
    });
}

export async function fetchLatestAIRequestLog(
    workspaceId: string,
    userId: string
): Promise<AIRequestLogs | null> {
    const requestLog = await getLatestAIRequestLog(workspaceId, userId);
    return getFormattedAILogs(requestLog);
}


export async function getAIRequestLogs(
    workspaceId: string,
    userId: string
): Promise<AIRequestLogs[]> {
    const logs = await prisma.aIRequestLog.findMany({
        where: {
            workspaceId,
            userId,
        },
        orderBy: {
            createdAt: "desc",
        },
        take: 20,
    });

    return logs.map((log) => getFormattedAILogs(log) as AIRequestLogs);
}