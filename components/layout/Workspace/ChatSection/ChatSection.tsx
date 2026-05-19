import Card from "@/components/Card/Card";
import styles from "./ChatSection.module.css";
import { ChatPanel } from "@/components/Chat/ChatPanel";
import { UIMessage } from "ai";

interface ChatSectionProps {
    workspaceId: string;
    hasDocuments: boolean;
    initialMessages: UIMessage[];
    messagesError?: string | null;
}

export const ChatSection = ({ workspaceId, hasDocuments, initialMessages, messagesError }: ChatSectionProps) => {
    return <Card title={"Chat Assistant"} className={styles.chatCard}>
        <div className={styles.content}>
            <ChatPanel
                workspaceId={workspaceId}
                hasDocuments={hasDocuments}
                initialMessages={initialMessages}
                messagesError={messagesError}
            />
        </div>
    </Card>;
};