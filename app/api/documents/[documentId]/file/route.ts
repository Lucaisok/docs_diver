import { DEV_USER_ID } from "@/src/lib/dev-user";
import { SiteContent } from "@/src/lib/content";
import { prisma } from "@/src/lib/prisma";
import { NextRequest } from "next/server";
import fs from "node:fs/promises";
import path from "node:path";

type RouteProps = {
    params: Promise<{
        documentId: string;
    }>;
};

export async function GET(_req: NextRequest, { params }: RouteProps) {
    try {
        const { documentId } = await params;

        if (!documentId) {
            return new Response(JSON.stringify({ error: SiteContent.noDocumentIdError }), {
                status: 400,
                headers: { "Content-Type": "application/json" },
            });
        }

        const document = await prisma.document.findFirst({
            where: {
                id: documentId,
                userId: DEV_USER_ID,
            },
        });

        if (!document) {
            return new Response(JSON.stringify({ error: SiteContent.documentNotFoundError }), {
                status: 404,
                headers: { "Content-Type": "application/json" },
            });
        }

        const resolvedFilePath = path.isAbsolute(document.filePath)
            ? path.resolve(document.filePath)
            : path.resolve(process.cwd(), document.filePath);

        const file = await fs.readFile(resolvedFilePath);
        const safeFileName = document.name.replace(/[\r\n"]/g, "_");

        return new Response(file, {
            headers: {
                "Content-Type": "application/pdf",
                "Content-Disposition": `inline; filename="${safeFileName}"; filename*=UTF-8''${encodeURIComponent(safeFileName)}`,
                "Cache-Control": "private, max-age=60",
            },
        });
    } catch (error) {
        const isMissingFileError =
            typeof error === "object" &&
            error !== null &&
            "code" in error &&
            (error as { code?: string; }).code === "ENOENT";

        if (isMissingFileError) {
            return new Response(JSON.stringify({ error: SiteContent.documentNotFoundError }), {
                status: 404,
                headers: { "Content-Type": "application/json" },
            });
        }

        console.error("Failed to serve document file", { error });

        return new Response(JSON.stringify({ error: SiteContent.internalServerError }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
        });
    }
}
