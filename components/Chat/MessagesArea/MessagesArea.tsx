import { useEffect, useRef } from "react";
import styles from "./messagesArea.module.css";
import { InitialMessage } from "@/src/types/message";
import { MessageItem } from "./components/MessageItem/MessageItem";
import { EmptyState } from "./components/EmptyState/EmptyState";
import { LoadingState } from "./components/LoadingState/LoadingState";
import { WelcomeMessage } from "./components/WelcomeMessage/WelcomeMessage";
import { SiteContent } from "@/src/lib/content";

interface MessagesAreaProps {
    workspaceId: string;
    displayMessages: InitialMessage[];
    isLoading: boolean;
    isThinking: boolean;
    hasDocuments: boolean;
    isDemo: boolean;
    showWelcomeMessage?: boolean;
    onUploadSuccess?: () => void;
}

export const MessagesArea = ({ workspaceId, displayMessages, isLoading, isThinking, hasDocuments, isDemo, showWelcomeMessage = false, onUploadSuccess }: MessagesAreaProps) => {
    const transcriptRef = useRef<HTMLDivElement>(null);
    const showDemoIntro = displayMessages.length === 0 && hasDocuments && isDemo;

    useEffect(() => {
        if (transcriptRef.current) {
            transcriptRef.current.scrollTop = transcriptRef.current.scrollHeight;
        }
    }, [displayMessages, isLoading]);

    return (
        <div className={styles.messagesArea}>
            <div ref={transcriptRef} className={`${styles.transcript} ${displayMessages.length > 0 ? styles.transcriptMasked : ""}`}>
                {displayMessages.length === 0 && !hasDocuments ? (
                    isDemo
                        ? <EmptyState workspaceId={workspaceId} isDemo={isDemo} />
                        : <EmptyState workspaceId={workspaceId} onUploadSuccess={onUploadSuccess} isDemo={isDemo} />
                ) : showDemoIntro ? (
                    <WelcomeMessage isActive text={SiteContent.demoWelcomeMessage} />
                ) : (
                    <>
                        <WelcomeMessage isActive={showWelcomeMessage && hasDocuments} />
                        {displayMessages.map((message) => <MessageItem key={message.id} message={message} />)}
                    </>
                )}

                {isThinking ? <LoadingState /> : null}
            </div>
        </div>
    );
};