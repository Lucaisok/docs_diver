import Card from "@/components/Card/Card";
import styles from "./ChatSection.module.css";
import { ChatPanel } from "@/components/Chat/ChatPanel";
import { InitialMessage } from "@/src/types/message";

interface ChatSectionProps {
    workspaceId: string;
    hasDocuments: boolean;
    initialMessages: InitialMessage[];
    messagesError?: string | null;
    onNewAnswer?: () => void;
}

export const ChatSection = ({ workspaceId, hasDocuments, initialMessages, messagesError, onNewAnswer }: ChatSectionProps) => {
    return <Card title={"Chat Assistant"} className={styles.chatCard}>
        <div className={styles.content}>
            <ChatPanel
                workspaceId={workspaceId}
                hasDocuments={hasDocuments}
                initialMessages={initialMessages}
                messagesError={messagesError}
                onNewAnswer={onNewAnswer}
            />
        </div>
    </Card>;
};