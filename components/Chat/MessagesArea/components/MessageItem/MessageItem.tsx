import { InitialMessage } from "@/src/types/message";
import styles from "./messageItem.module.css";
import { Citations } from "../Citations/Citations";

type MessageItemProps = {
    message: InitialMessage;
};

export const MessageItem = ({ message }: MessageItemProps) => {
    return (
        <div
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
                    ) : null,
                )}

                {message.role === "assistant" && message.citations ? (
                    <Citations citations={message.citations} />
                ) : null}
            </div>
        </div>
    );
};
