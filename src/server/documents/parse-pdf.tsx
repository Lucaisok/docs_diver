import fs from "fs/promises";
import path from "path";
import { PDFParse } from "pdf-parse";

const PDF_WORKER_PATH = path.join(
    process.cwd(),
    "node_modules",
    "pdfjs-dist",
    "legacy",
    "build",
    "pdf.worker.mjs"
);

const configurePdfWorker = async () => {
    try {
        await fs.access(PDF_WORKER_PATH);
        PDFParse.setWorker(PDF_WORKER_PATH);
        return;
    } catch (error) {
        console.warn("PDF worker file not found, using library default worker resolution", {
            workerPath: PDF_WORKER_PATH,
            error,
        });
    }

    PDFParse.setWorker();
};

export async function parsePdfText(filePath: string) {
    const buffer = await fs.readFile(filePath);
    await configurePdfWorker();

    const parser = new PDFParse({ data: buffer });
    try {
        const data = await parser.getText();

        return {
            text: data.text,
            pages: data.pages,
        };
    } catch (error) {
        console.error("PDF text extraction failed", { filePath, error });

        if (error instanceof Error) {
            throw new Error(`PDF text extraction failed: ${error.message}`);
        }

        throw new Error("PDF text extraction failed due to an unknown error.");
    } finally {
        await parser.destroy();
    }
}