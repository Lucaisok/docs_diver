import { streamText } from "ai";
import { openai } from "@ai-sdk/openai";
import { parseAndValidateRequest, systemPrompt, assertWorkspaceAccess, getLastMessageContent, saveUserMessage, getChunks, buildMessageAndHistory, saveModelAnswer, buildCitations as formatChunkAsCitations, selectBestChunks, filterUsedCitations, saveAIRequestLog } from "@/src/server/utils/utils";
import { SiteContent } from "@/src/lib/content";
import { getCurrentUserId } from "@/src/server/auth/session-user";

export const runtime = "nodejs";

export async function POST(req: Request) {
    try {
        const userId = await getCurrentUserId();
        const startedAt = Date.now();
        //parse and validate request
        const parseAndValidatResult = await parseAndValidateRequest(req);
        if (!parseAndValidatResult.ok) return parseAndValidatResult.response;
        const { messages, workspaceId } = parseAndValidatResult.data;

        //assert workspace exist and user has access
        const workspaceResult = await assertWorkspaceAccess(userId, workspaceId);
        if (!workspaceResult.ok) return workspaceResult.response;

        //retrieve last message content
        const getLastMessageResult = getLastMessageContent(messages);
        if (!getLastMessageResult.ok) return getLastMessageResult.response;
        const { messageContent } = getLastMessageResult.data;

        // Save user message
        const saveResult = await saveUserMessage(userId, workspaceId, messageContent);
        if (!saveResult.ok) return saveResult.response;

        // Retrieve relevant document chunks for context
        const chunks = await getChunks(workspaceId, messageContent);
        // Chunks selection strategy
        const selectedChunks = selectBestChunks(chunks);
        //build message with context and format message history for model
        const { history, messageWithContext, estimatedInputTokens } = buildMessageAndHistory(selectedChunks, messages, messageContent);

        const chunksAsCitations = formatChunkAsCitations(selectedChunks);
        let streamedText = "";

        const result = streamText({
            model: openai("gpt-4o-mini"),
            system: systemPrompt,
            messages: [
                ...history,
                {
                    role: "user",
                    content: messageWithContext,
                },
            ],
            async onFinish({ text }) {
                const usedCitations = filterUsedCitations(text || streamedText, chunksAsCitations);
                await saveModelAnswer(userId, workspaceId, text, usedCitations);
                await saveAIRequestLog(userId, chunksAsCitations, usedCitations, workspaceId, messageContent, estimatedInputTokens, text || streamedText, startedAt);
            },
        });

        return result.toUIMessageStreamResponse({
            messageMetadata: ({ part }) => {
                if (part.type === "text-delta") {
                    streamedText += part.text;
                }

                if (part.type === "finish") {
                    return { citations: filterUsedCitations(streamedText, chunksAsCitations) };
                }

                return undefined;
            },
        });

    } catch (error) {
        console.error("Chat API error:", error);
        return new Response(
            JSON.stringify({
                error: error instanceof Error ? error.message : SiteContent.internalServerError,
            }),
            { status: 500 }
        );
    }
}

