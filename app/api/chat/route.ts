import { streamText } from "ai";
import { openai } from "@ai-sdk/openai";
import { parseAndValidateRequest, systemPrompt, assertWorkspaceAccess, getLastMessageContent, saveUserMessage, getChunks, buildMessageAndHistory, saveModelAnswer } from "@/src/server/utils/utils";
import { SiteContent } from "@/src/lib/content";

export const runtime = "nodejs";

export async function POST(req: Request) {
    try {
        //parse and validate request
        const parseAndValidatResult = await parseAndValidateRequest(req);
        if (!parseAndValidatResult.ok) return parseAndValidatResult.response;
        const { messages, workspaceId } = parseAndValidatResult.data;

        //assert workspace exist and user has access
        const workspaceResult = await assertWorkspaceAccess(workspaceId);
        if (!workspaceResult.ok) return workspaceResult.response;

        //retrieve last message content
        const getLastMessageResult = getLastMessageContent(messages);
        if (!getLastMessageResult.ok) return getLastMessageResult.response;
        const { messageContent } = getLastMessageResult.data;

        // Save user message
        const saveResult = await saveUserMessage(workspaceId, messageContent);
        if (!saveResult.ok) return saveResult.response;

        // Retrieve relevant document chunks for context
        const chunks = await getChunks(workspaceId, messageContent);

        //build message with context and format message history for model
        const { history, messageWithContext } = buildMessageAndHistory(chunks, messages, messageContent);

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
                await saveModelAnswer(workspaceId, text);
            },
        });

        return result.toUIMessageStreamResponse();

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

