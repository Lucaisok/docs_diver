import { useEffect, useRef } from "react";
import styles from "./messagesArea.module.css";
import { InitialMessage } from "@/src/types/message";
import { MessageItem } from "./components/MessageItem/MessageItem";
import { EmptyState } from "./components/EmptyState/EmptyState";
import { LoadingState } from "./components/LoadingState/LoadingState";

interface MessagesAreaProps {
    displayMessages: InitialMessage[];
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
            <div ref={transcriptRef} className={`${styles.transcript} ${displayMessages.length > 0 ? styles.transcriptMasked : ""}`}>
                {displayMessages.length === 0 ? (
                    <EmptyState />
                ) : (
                    displayMessages.map((message) => <MessageItem key={message.id} message={message} />)
                )}

                {isLoading ? <LoadingState /> : null}
            </div>
        </div>
    );
};