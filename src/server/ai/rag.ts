import { SiteContent } from "@/src/lib/content";
import { systemPrompt, truncateContext } from "../utils/utils";
import { openai } from "./embeddings";
import { retrieveRelevantChunks } from "./retrieval";

export type RAGResponse = {
    answer: string;
    citations: Array<{
        sourceNumber: number;
        documentId: string;
        documentName: string;
        chunkIndex: number;
        excerpt: string;
        similarity: number;
    }>;
};

export async function answerQuestion({
    workspaceId,
    question,
    model = "gpt-4o-mini",
}: {
    workspaceId: string;
    question: string;
    model?: string;
}): Promise<RAGResponse> {
    try {
        // Input validation
        const trimmedQuestion = question.trim();
        if (!workspaceId || !trimmedQuestion) {
            return {
                answer: SiteContent.provideQuestion,
                citations: [],
            };
        }

        const chunks = await retrieveRelevantChunks({
            workspaceId,
            query: trimmedQuestion,
            limit: 6,
            minSimilarity: 0.2,
        });

        if (chunks.length === 0) {
            return {
                answer: SiteContent.noInfoRetrieved,
                citations: [],
            };
        }

        // Format context with source headers
        const context = chunks
            .map(
                (chunk, index) =>
                    `[Source ${index + 1}]\n` +
                    `Document: ${chunk.documentName}\n` +
                    `Chunk: ${chunk.chunkIndex}\n` +
                    `Content:\n${chunk.content}`
            )
            .join("\n\n");

        // Estimate and truncate context if needed to fit within token budget
        // Reserve ~500 tokens for answer + overhead
        const maxContextTokens = 3500;
        const truncatedContext = truncateContext(context, maxContextTokens);

        const response = await openai.chat.completions.create({
            model,
            messages: [
                {
                    role: "system",
                    content: systemPrompt,
                },
                {
                    role: "user",
                    content: `Context:\n${truncatedContext}\n\nQuestion:\n${trimmedQuestion}`,
                },
            ],
            temperature: 0.2, // Lower temperature for more factual answers
        });

        const answer = response.choices[0]?.message.content?.trim() ?? "";

        if (!answer) {
            return {
                answer: SiteContent.noResponseFromModel,
                citations: [],
            };
        }

        return {
            answer,
            citations: chunks.map((chunk, index) => ({
                sourceNumber: index + 1,
                documentId: chunk.documentId,
                documentName: chunk.documentName,
                chunkIndex: chunk.chunkIndex,
                excerpt: chunk.content.slice(0, 300),
                similarity: chunk.similarity,
            })),
        };
    } catch (error) {
        console.error("Failed to answer question", { workspaceId, question, error });
        return {
            answer: SiteContent.questionProcessingError,
            citations: [],
        };
    }
}