import { SiteContent } from "@/src/lib/content";
import { UIDataTypes, UIMessage, UITools } from "ai";
import styles from "./messagesArea.module.css";

interface MessagesAreaProps {
    displayMessages: UIMessage<unknown, UIDataTypes, UITools>[];
}

export const MessagesArea = ({ displayMessages }: MessagesAreaProps) => {
    return (
        <div className={styles.messagesArea}>
            {displayMessages.length === 0 ? (
                <div className={styles.emptyState}>
                    <p className={styles.emptyStateTitle}>{SiteContent.firstQuestion}</p>
                    <p className={styles.emptyStateDescription}>
                        {SiteContent.promptDescription}
                    </p>
                </div>
            ) : (
                displayMessages.map((message) => (
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
    );
};