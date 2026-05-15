type ChunkTextOptions = {
    maxChars?: number;
    overlapChars?: number;
};

export const chunkText = (
    text: string,
    options: ChunkTextOptions = {}
): string[] => {
    const maxChars = options.maxChars ?? 3000;
    const overlapChars = options.overlapChars ?? 300;

    const cleaned = text
        .replace(/\r/g, "")
        .replace(/\n{3,}/g, "\n\n")
        .trim();

    if (!cleaned) return [];

    const chunks: string[] = [];
    let start = 0;

    while (start < cleaned.length) {
        const end = Math.min(start + maxChars, cleaned.length);
        const chunk = cleaned.slice(start, end).trim();

        if (chunk) chunks.push(chunk);

        if (end === cleaned.length) break;

        start = Math.max(0, end - overlapChars);
    }

    return chunks;
};