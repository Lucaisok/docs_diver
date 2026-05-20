import { SiteContent } from "@/src/lib/content";
import { ChevronDown, Loader2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import styles from "./messagesArea.module.css";
import { InitialMessage } from "@/src/types/message";

interface MessagesAreaProps {
    displayMessages: InitialMessage[];
    isLoading: boolean;
}

export const MessagesArea = ({ displayMessages, isLoading }: MessagesAreaProps) => {
    const transcriptRef = useRef<HTMLDivElement>(null);
    const [expandedSourceMessageIds, setExpandedSourceMessageIds] = useState<Record<string, boolean>>({});

    const toggleSources = (messageId: string) => {
        setExpandedSourceMessageIds((current) => ({
            ...current,
            [messageId]: !current[messageId],
        }));
    };

    useEffect(() => {
        if (transcriptRef.current) {
            transcriptRef.current.scrollTop = transcriptRef.current.scrollHeight;
        }
    }, [displayMessages, isLoading]);

    return (
        <div className={styles.messagesArea}>
            <div ref={transcriptRef} className={`${styles.transcript} ${displayMessages.length > 0 ? styles.transcriptMasked : ""}`}>
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
                            <div>
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

                                {message.role === "assistant" &&
                                    message.citations &&
                                    message.citations.length > 0 && (
                                        <div className={styles.citationsSection}>
                                            <button
                                                type="button"
                                                className={styles.citationsToggle}
                                                onClick={() => toggleSources(message.id)}
                                                aria-expanded={expandedSourceMessageIds[message.id] === true}
                                            >
                                                <ChevronDown
                                                    className={`${styles.citationsChevron} ${expandedSourceMessageIds[message.id] ? styles.citationsChevronExpanded : ""}`}
                                                    aria-hidden="true"
                                                />
                                                <span className={styles.citationsTitle}>Sources</span>
                                            </button>

                                            {expandedSourceMessageIds[message.id] && (
                                                <div className={styles.citationsList}>
                                                    {message.citations.map((citation) => (
                                                        <div
                                                            key={`${citation.documentId}-${citation.chunkIndex}`}
                                                            className={styles.citationCard}
                                                        >
                                                            <p className={styles.citationSource}>
                                                                [Source {citation.sourceNumber}] {citation.documentName}
                                                            </p>

                                                            <p className={styles.citationMeta}>
                                                                Chunk {citation.chunkIndex} · similarity{" "}
                                                                {citation.similarity.toFixed(3)}
                                                            </p>

                                                            <p className={styles.citationExcerpt}>
                                                                {citation.excerpt}...
                                                            </p>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    )}
                            </div>
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