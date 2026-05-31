type ChunkTextOptions = {
    maxChars?: number;
    overlapChars?: number;
    minChars?: number;
};

const looksLikeHeading = (line: string) => {
    const trimmed = line.trim();

    if (!trimmed) return false;
    if (trimmed.length > 120) return false;

    // Heuristics tuned for extracted PDF text where heading markup is inconsistent.
    return (
        /^#{1,6}\s+/.test(trimmed) || // markdown heading
        /^\d+(\.\d+)*\s+/.test(trimmed) || // 1. / 1.2 / 2.3.1
        /^[A-Z][A-Z\s\-:]{5,}$/.test(trimmed) || // ALL CAPS HEADING
        /^[A-Z][A-Za-z\s\-:]{3,}$/.test(trimmed) // Title Case-ish
    );
};

const splitIntoSections = (text: string) => {
    const lines = text.split("\n");
    const sections: string[] = [];

    let current: string[] = [];

    for (const line of lines) {
        // Start a new section when a heading is found after some collected content.
        if (looksLikeHeading(line) && current.length > 0) {
            sections.push(current.join("\n").trim());
            current = [line];
        } else {
            current.push(line);
        }
    }

    if (current.length > 0) {
        sections.push(current.join("\n").trim());
    }

    return sections.filter(Boolean);
};

const splitLongText = (
    text: string,
    maxChars: number,
    overlapChars: number
) => {
    const chunks: string[] = [];
    let start = 0;

    while (start < text.length) {
        // Create an initial fixed-size window.
        let end = Math.min(start + maxChars, text.length);

        const slice = text.slice(start, end);

        const lastParagraphBreak = slice.lastIndexOf("\n\n");
        const lastSentenceBreak = Math.max(
            slice.lastIndexOf(". "),
            slice.lastIndexOf("? "),
            slice.lastIndexOf("! ")
        );

        // Prefer breaking on paragraph/sentence boundaries when close enough to window end.
        if (end < text.length) {
            if (lastParagraphBreak > maxChars * 0.5) {
                end = start + lastParagraphBreak;
            } else if (lastSentenceBreak > maxChars * 0.5) {
                end = start + lastSentenceBreak + 1;
            }
        }

        const chunk = text.slice(start, end).trim();
        if (chunk) chunks.push(chunk);

        if (end >= text.length) break;

        // Move forward with overlap to preserve context across adjacent chunks.
        start = Math.max(0, end - overlapChars);
    }

    return chunks;
};

export const chunkText = (
    text: string,
    {
        maxChars = 3000,
        overlapChars = 250,
        minChars = 500,
    }: ChunkTextOptions = {}
): string[] => {
    // Normalize whitespace so heading/sentence detection is more predictable.
    const cleaned = text
        .replace(/\r/g, "")
        .replace(/[ \t]+/g, " ")
        .replace(/\n{3,}/g, "\n\n")
        .trim();

    if (!cleaned) return [];

    const sections = splitIntoSections(cleaned);

    const chunks: string[] = [];
    let buffer = "";

    for (const section of sections) {
        // Very large sections are split directly with overlap for retrieval continuity.
        if (section.length > maxChars) {
            // Flush any meaningful buffered content before handling the large section.
            if (buffer.length >= minChars) {
                chunks.push(buffer.trim());
                buffer = "";
            }

            chunks.push(...splitLongText(section, maxChars, overlapChars));
            continue;
        }

        // Keep appending sections while we stay under max chunk size.
        const candidate = buffer ? `${buffer}\n\n${section}` : section;

        if (candidate.length <= maxChars) {
            buffer = candidate;
        } else {
            // Candidate overflowed: emit current buffer and start a new one.
            if (buffer.trim()) chunks.push(buffer.trim());
            buffer = section;
        }
    }

    if (buffer.trim()) chunks.push(buffer.trim());

    return chunks;
};