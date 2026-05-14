import { getWorkspaceById } from "@/src/server/queries/workspaces";
import { ChatSection } from "../ChatSection/ChatSection";
import { DocumentsSection } from "../DocumentsSection/DocumentsSection";
import { Hero } from "../HeroSection/Hero";
import styles from "./wrapper.module.css";
import { DEV_USER_ID } from "@/src/lib/dev-user";

type WrapperProps = {
    workspaceId: string;
};

export const Wrapper = async ({ workspaceId }: WrapperProps) => {
    const result = await getWorkspaceById(workspaceId, DEV_USER_ID);

    if (result.error || !result.data || !result.success) {
        return <p className={styles.error}>{result.error}</p>;
    }

    const workspace = result.data;

    return <>
        <Hero workspaceName={workspace.name} documentsNumber={workspace._count.documents} chatsNumber={workspace._count.chats} />
        <div className={styles.layout}>
            <ChatSection />
            <DocumentsSection documents={workspace.documents} />
        </div>
    </>;
};