import Card from "@/components/Card/Card";
import styles from "./ChatSection.module.css";
import { ChatPanel } from "@/components/Chat/ChatPanel";
import { UIMessage } from "ai";

interface ChatSectionProps {
    workspaceId: string;
    initialMessages: UIMessage[];
    messagesError?: string | null;
}

export const ChatSection = ({ workspaceId, initialMessages, messagesError }: ChatSectionProps) => {
    return <Card title={""}>
        <div className={styles.content}>
            <ChatPanel workspaceId={workspaceId} initialMessages={initialMessages} messagesError={messagesError} />
        </div>
    </Card>;
};