"use client";
import { useState } from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, UIMessage } from "ai";
import styles from "./ChatPanel.module.css";
import { SiteContent } from "@/src/lib/content";
import { MessagesArea } from "./MessagesArea/MessagesArea";
import { InputArea } from "./InputArea/InputArea";
import { ErrorArea } from "./ErrorArea/ErrorArea";

type ChatPanelProps = {
    workspaceId: string;
    hasDocuments: boolean;
    initialMessages: UIMessage[];
    messagesError?: string | null;
};

export function ChatPanel({ workspaceId, hasDocuments, initialMessages, messagesError }: ChatPanelProps) {
    const [chatError, setChatError] = useState<string | null>(null);

    const { messages, sendMessage, status } = useChat({
        id: workspaceId,
        transport: new DefaultChatTransport({
            api: "/api/chat",
            body: { workspaceId },
        }),
        onError: (error) => {
            console.error("Chat error:", error);
            setChatError(SiteContent.chatError);
        },
    });

    const allMessages = [...initialMessages, ...messages];
    const displayMessages = allMessages.length > 0 ? allMessages : initialMessages;
    const isLoading = status === "submitted" || status === "streaming";

    const send = (value: { text: string; }) => sendMessage(value);
    const cleanInputError = () => setChatError(null);

    return (
        <div className={styles.panel}>
            <ErrorArea chatError={chatError} messagesError={messagesError} />
            <MessagesArea displayMessages={displayMessages} isLoading={isLoading} />
            <InputArea
                send={send}
                cleanInputError={cleanInputError}
                isLoading={isLoading}
                isDisabled={!hasDocuments}
            />
        </div>
    );
}