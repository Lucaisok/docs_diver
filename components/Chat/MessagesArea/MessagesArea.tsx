import { SiteContent } from "@/src/lib/content";
import { UIDataTypes, UIMessage, UITools } from "ai";
import { Loader2 } from "lucide-react";
import { useEffect, useRef } from "react";
import styles from "./messagesArea.module.css";

interface MessagesAreaProps {
    displayMessages: UIMessage<unknown, UIDataTypes, UITools>[];
    isLoading: boolean;
}

export const MessagesArea = ({ displayMessages, isLoading }: MessagesAreaProps) => {
    const transcriptRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (transcriptRef.current) {
            transcriptRef.current.scrollTop = transcriptRef.current.scrollHeight;
        }
    }, [displayMessages, isLoading]);

    return (
        <div className={styles.messagesArea}>
            <div ref={transcriptRef} className={styles.transcript}>
                {displayMessages.length === 0 ? (
                    <div className={styles.emptyState}>
                        <p className={styles.emptyStateTitle}>{SiteContent.firstQuestion}</p>
                        <p className={styles.emptyStateDescription}>
                            {SiteContent.promptDescription}
                        </p>
                    </div>
                ) : (
                    displayMessages.map((message) => (
                        <div
                            key={message.id}
                            className={`${styles.messageRow} ${message.role === "user" ? styles.userMessageRow : styles.assistantMessageRow}`}
                        >
                            {message.parts?.map((part, index) =>
                                part.type === "text" ? (
                                    <p
                                        key={index}
                                        className={`${styles.messageText} ${message.role === "user" ? styles.userMessageText : styles.assistantMessageText}`}
                                    >
                                        {part.text}
                                    </p>
                                ) : null
                            )}
                        </div>
                    ))
                )}

                {isLoading ? (
                    <div className={`${styles.messageRow} ${styles.assistantMessageRow}`}>
                        <div className={styles.loadingState} aria-live="polite" aria-label={SiteContent.thinking}>
                            <Loader2 className={styles.loadingIcon} aria-hidden="true" />
                            <span>{SiteContent.thinking}</span>
                        </div>
                    </div>
                ) : null}
            </div>
        </div>
    );
};