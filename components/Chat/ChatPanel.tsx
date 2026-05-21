"use client";
import { useEffect, useRef, useState } from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, UIMessage } from "ai";
import styles from "./ChatPanel.module.css";
import { SiteContent } from "@/src/lib/content";
import { MessagesArea } from "./MessagesArea/MessagesArea";
import { InputArea } from "./InputArea/InputArea";
import { ErrorArea } from "./ErrorArea/ErrorArea";
import { ChatMessageMetadata, InitialMessage } from "@/src/types/message";
import { getFormattedMessages } from "@/src/lib/formatters";

type ChatPanelProps = {
    workspaceId: string;
    hasDocuments: boolean;
    initialMessages: InitialMessage[];
    messagesError?: string | null;
    onNewAnswer?: () => void;
    onUploadSuccess?: () => void;
};

export function ChatPanel({ workspaceId, hasDocuments, initialMessages, messagesError, onNewAnswer, onUploadSuccess }: ChatPanelProps) {
    const [chatError, setChatError] = useState<string | null>(null);
    const [hasAvailableDocuments, setHasAvailableDocuments] = useState(hasDocuments);
    const [showWelcomeMessage, setShowWelcomeMessage] = useState(false);
    const hadDocumentsRef = useRef(hasDocuments);

    useEffect(() => {
        setHasAvailableDocuments(hasDocuments);
    }, [hasDocuments]);

    useEffect(() => {
        const hadDocuments = hadDocumentsRef.current;

        if (!hadDocuments && hasAvailableDocuments) {
            setShowWelcomeMessage(true);
        }

        hadDocumentsRef.current = hasAvailableDocuments;
    }, [hasAvailableDocuments]);

    const { messages, sendMessage, status } = useChat<UIMessage<ChatMessageMetadata>>({
        id: workspaceId,
        transport: new DefaultChatTransport({
            api: "/api/chat",
            body: { workspaceId },
        }),
        onError: (error) => {
            console.error("Chat error:", error);
            setChatError(SiteContent.chatError);
        },
        onFinish: () => {
            onNewAnswer?.();
        },
    });

    const allMessages = [...initialMessages, ...messages];
    const displayMessages = allMessages.length > 0 ? allMessages : initialMessages;
    const isLoading = status === "submitted" || status === "streaming";

    //add citations
    const formattedMessages = getFormattedMessages(displayMessages);

    const send = (value: { text: string; }) => sendMessage(value);
    const cleanInputError = () => setChatError(null);

    return (
        <div className={styles.panel}>
            <ErrorArea chatError={chatError} messagesError={messagesError} />
            <MessagesArea
                workspaceId={workspaceId}
                displayMessages={formattedMessages}
                isLoading={isLoading}
                hasDocuments={hasAvailableDocuments}
                showWelcomeMessage={showWelcomeMessage}
                onUploadSuccess={() => {
                    setHasAvailableDocuments(true);
                    onUploadSuccess?.();
                }}
            />
            <InputArea
                send={send}
                cleanInputError={cleanInputError}
                isLoading={isLoading}
                isDisabled={!hasAvailableDocuments}
            />
        </div>
    );
}