import { prisma } from "@/src/lib/prisma";
import { Prisma } from "@prisma/client";
import { randomUUID } from "node:crypto";
import path from "node:path";
import { writeChunks } from "../utils/utils";

const DEMO_PDF_PATH = path.join(process.cwd(), "uploads", "demo", "Alice.pdf");
const DEMO_DOCUMENT_NAME = "Alice.pdf";
const DEMO_SEED_USER_EMAIL = "demo-seed@anonymous.docs-diver.local";
const DEMO_SEED_WORKSPACE_NAME = "Demo Seed Workspace";

const DEMO_WORKSPACE_NAME = "Demo Workspace";

export async function createDemoWorkspaceForUser(userId: string) {
    const normalizedUserId = userId.trim();

    if (!normalizedUserId) {
        throw new Error("Cannot create demo workspace without a userId.");
    }

    const existingDemo = await prisma.workspace.findFirst({
        where: {
            userId: normalizedUserId,
            isDemo: true,
        },
        orderBy: {
            createdAt: "asc",
        },
    });

    if (existingDemo) {
        await ensureDemoDocumentForWorkspace(existingDemo.id, normalizedUserId);
        return existingDemo;
    }

    try {
        const demoWorkspace = await prisma.workspace.create({
            data: {
                name: DEMO_WORKSPACE_NAME,
                userId: normalizedUserId,
                isDemo: true,
            },
        });

        await ensureDemoDocumentForWorkspace(demoWorkspace.id, normalizedUserId);

        return demoWorkspace;
    } catch (error) {
        // Handle concurrent requests trying to create the same demo workspace.
        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
            const demoAfterConflict = await prisma.workspace.findFirst({
                where: {
                    userId: normalizedUserId,
                    isDemo: true,
                },
                orderBy: {
                    createdAt: "asc",
                },
            });

            if (demoAfterConflict) {
                await ensureDemoDocumentForWorkspace(demoAfterConflict.id, normalizedUserId);
                return demoAfterConflict;
            }
        }

        throw error;
    }
}

async function ensureDemoDocumentForWorkspace(workspaceId: string, userId: string) {
    const existingDemoDocument = await prisma.document.findFirst({
        where: {
            workspaceId,
            isDemo: true,
        },
        select: {
            id: true,
            status: true,
        },
    });

    if (existingDemoDocument) {
        if (existingDemoDocument.status === "INDEXED" || existingDemoDocument.status === "PROCESSING") {
            return existingDemoDocument;
        }

        await prisma.document.delete({
            where: {
                id: existingDemoDocument.id,
            },
        });
    }

    try {
        const seed = await ensureDemoSeed();

        if (!seed) {
            return null;
        }

        const demoDocument = await prisma.document.create({
            data: {
                workspaceId,
                userId,
                name: DEMO_DOCUMENT_NAME,
                filePath: DEMO_PDF_PATH,
                status: "INDEXED",
                isDemo: true,
            },
        });

        const seedChunks = await prisma.$queryRaw<Array<{
            content: string;
            pageNumber: number | null;
            chunkIndex: number;
            tokenCount: number | null;
            embedding: string | null;
        }>>`
            SELECT
                content,
                "pageNumber",
                "chunkIndex",
                "tokenCount",
                embedding::text AS embedding
            FROM "DocumentChunk"
            WHERE "documentId" = ${seed.documentId}
            ORDER BY "chunkIndex" ASC
        `;

        if (seedChunks.length === 0) {
            throw new Error("Demo seed has no chunks.");
        }

        await prisma.$transaction(async (tx) => {
            for (const chunk of seedChunks) {
                await tx.$executeRaw`
                    INSERT INTO "DocumentChunk"
                    (
                        id,
                        "documentId",
                        "workspaceId",
                        content,
                        "pageNumber",
                        "chunkIndex",
                        "tokenCount",
                        embedding,
                        "createdAt"
                    )
                    VALUES
                    (
                        ${randomUUID()},
                        ${demoDocument.id},
                        ${workspaceId},
                        ${chunk.content},
                        ${chunk.pageNumber},
                        ${chunk.chunkIndex},
                        ${chunk.tokenCount},
                        ${chunk.embedding}::vector,
                        NOW()
                    )
                `;
            }
        });

        return demoDocument;
    } catch (error) {
        console.error("Failed to ensure demo document for workspace", {
            workspaceId,
            userId,
            error,
        });

        return existingDemoDocument;
    }
}

async function ensureDemoSeed() {
    const existingSeed = await prisma.user.findFirst({
        where: {
            email: DEMO_SEED_USER_EMAIL,
        },
        select: {
            id: true,
        },
    });

    const seedUser = existingSeed ?? await prisma.user.create({
        data: {
            email: DEMO_SEED_USER_EMAIL,
            name: "Demo Seed",
            isAnonymous: false,
        },
        select: {
            id: true,
        },
    });

    const seedWorkspace = await prisma.workspace.findFirst({
        where: {
            userId: seedUser.id,
            name: DEMO_SEED_WORKSPACE_NAME,
            isDemo: true,
        },
        select: {
            id: true,
        },
    }) ?? await prisma.workspace.create({
        data: {
            userId: seedUser.id,
            name: DEMO_SEED_WORKSPACE_NAME,
            isDemo: true,
        },
        select: {
            id: true,
        },
    });

    const seedDocument = await prisma.document.findFirst({
        where: {
            workspaceId: seedWorkspace.id,
            name: DEMO_DOCUMENT_NAME,
            isDemo: true,
        },
        select: {
            id: true,
        },
    });

    if (seedDocument) {
        const existingChunks = await prisma.documentChunk.count({
            where: {
                documentId: seedDocument.id,
            },
        });

        if (existingChunks > 0) {
            return { documentId: seedDocument.id };
        }
    }

    const seedFileDocument = seedDocument ?? await prisma.document.create({
        data: {
            workspaceId: seedWorkspace.id,
            userId: seedUser.id,
            name: DEMO_DOCUMENT_NAME,
            filePath: DEMO_PDF_PATH,
            status: "PROCESSING",
            isDemo: true,
        },
        select: {
            id: true,
        },
    });

    const indexingResult = await writeChunks({
        filePath: DEMO_PDF_PATH,
        documentId: seedFileDocument.id,
        workspaceId: seedWorkspace.id,
    });

    if (!indexingResult.success) {
        await prisma.document.update({
            where: {
                id: seedFileDocument.id,
            },
            data: {
                status: "FAILED",
                error: indexingResult.error,
            },
        });

        throw new Error(indexingResult.error ?? "Failed to seed demo document.");
    }

    await prisma.document.update({
        where: {
            id: seedFileDocument.id,
        },
        data: {
            status: "INDEXED",
            error: null,
        },
    });

    return { documentId: seedFileDocument.id };
}