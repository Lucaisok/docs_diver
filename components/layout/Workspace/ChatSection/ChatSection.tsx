"use client";
import Card from "@/components/Card/Card";
import styles from "./ChatSection.module.css";
import { ChatPanel } from "@/components/Chat/ChatPanel";
import { InitialMessage } from "@/src/types/message";
import { Maximize2, Minimize2 } from "lucide-react";
import { useEffect, useState } from "react";

interface ChatSectionProps {
    workspaceId: string;
    hasDocuments: boolean;
    isDemo: boolean;
    initialMessages: InitialMessage[];
    messagesError?: string | null;
    onNewAnswer?: () => void;
    onUploadSuccess?: () => void;
}

export const ChatSection = ({ workspaceId, hasDocuments, isDemo, initialMessages, messagesError, onNewAnswer, onUploadSuccess }: ChatSectionProps) => {
    const [isExpanded, setIsExpanded] = useState(false);

    useEffect(() => {
        if (!isExpanded) {
            document.body.style.removeProperty("overflow");
            return;
        }

        document.body.style.setProperty("overflow", "hidden");

        return () => {
            document.body.style.removeProperty("overflow");
        };
    }, [isExpanded]);

    return (
        <>
            {isExpanded ? (
                <button
                    type="button"
                    className={styles.backdrop}
                    aria-label="Collapse chat"
                    onClick={() => setIsExpanded(false)}
                />
            ) : null}
            <Card
                title="Chat Assistant"
                className={`${styles.chatCard} ${isExpanded ? styles.chatCardExpanded : ""}`}
            >
                <div className={styles.content}>
                    <button
                        type="button"
                        className={styles.expandButton}
                        onClick={() => setIsExpanded((current) => !current)}
                        aria-label={isExpanded ? "Collapse chat" : "Expand chat"}
                        title={isExpanded ? "Collapse chat" : "Expand chat"}
                    >
                        {isExpanded ? (
                            <Minimize2 className={styles.expandIcon} aria-hidden="true" />
                        ) : (
                            <Maximize2 className={styles.expandIcon} aria-hidden="true" />
                        )}
                    </button>
                    <ChatPanel
                        workspaceId={workspaceId}
                        hasDocuments={hasDocuments}
                        isDemo={isDemo}
                        initialMessages={initialMessages}
                        messagesError={messagesError}
                        onNewAnswer={onNewAnswer}
                        onUploadSuccess={onUploadSuccess}
                    />
                </div>
            </Card>
        </>
    );
};