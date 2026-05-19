"use client";

import { useState, type FormEvent } from "react";
import { useChat } from "@ai-sdk/react";
import Input from "../Input/Input";
import Button from "../Button/Button";
import { DefaultChatTransport, UIMessage } from "ai";
import styles from "./ChatPanel.module.css";
import { SiteContent } from "@/src/lib/content";

type ChatPanelProps = {
    workspaceId: string;
    initialMessages: UIMessage[];
    messagesError?: string | null;
};

export function ChatPanel({ workspaceId, initialMessages, messagesError }: ChatPanelProps) {
    const [input, setInput] = useState("");

    const { messages, sendMessage, status } = useChat({
        id: workspaceId, // stable chat state key per workspace
        messages: initialMessages,
        transport: new DefaultChatTransport({
            api: "/api/chat",
            body: { workspaceId },
        }),
    });

    const isLoading = status === "submitted" || status === "streaming";

    const handleFormSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        const value = input.trim();

        if (!value || isLoading) {
            return;
        }

        sendMessage({ text: value });
        setInput("");
    };

    return (
        <div className={styles.panel}>
            {messagesError ? (
                <p className={styles.warning}>
                    {SiteContent.messagesLoadWarning}
                </p>
            ) : null}
            <div className={styles.messagesArea}>
                {messages.length === 0 ? (
                    <div className={styles.emptyState}>
                        <p className={styles.emptyStateTitle}>{SiteContent.firstQuestion}</p>
                        <p className={styles.emptyStateDescription}>
                            {SiteContent.promptDescription}
                        </p>
                    </div>
                ) : (
                    messages.map((message) => (
                        <div key={message.id} className={styles.messageCard}>
                            <p className={styles.messageRole}>
                                {message.role}
                            </p>

                            {message.parts?.map((part, index) =>
                                part.type === "text" ? (
                                    <p key={index} className={styles.messageText}>
                                        {part.text}
                                    </p>
                                ) : null
                            )}
                        </div>
                    ))
                )}
            </div>

            <form onSubmit={handleFormSubmit} className={styles.form}>
                <Input
                    className={styles.input}
                    value={input}
                    onChange={(event) => setInput(event.target.value)}
                    placeholder={SiteContent.questionPlaceholder}
                />
                <Button type="submit" disabled={isLoading}>
                    {isLoading ? SiteContent.thinking : SiteContent.ask}
                </Button>
            </form>
        </div>
    );
}