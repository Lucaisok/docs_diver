import Card from "@/components/Card/Card";
import styles from "./ChatSection.module.css";
import { ChatPanel } from "@/components/Chat/ChatPanel";

interface ChatSectionProps {
    workspaceId: string;
}

export const ChatSection = ({ workspaceId }: ChatSectionProps) => {
    return <Card title={""}>
        <div className={styles.content}>
            <ChatPanel workspaceId={workspaceId} />
        </div>
    </Card>;
};