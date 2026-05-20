import { getWorkspaceById } from "@/src/server/queries/workspaces";
import styles from "./wrapper.module.css";
import { DEV_USER_ID } from "@/src/lib/dev-user";
import { WorkspaceShell } from "../WorkspaceShell/WorkspaceShell";
import { notFound } from "next/navigation";
import { SiteContent } from "@/src/lib/content";
import { getMessagesByWorkspace } from "@/src/server/queries/messages";
import { InitialMessage } from "@/src/types/message";
import { parseCitations } from "@/src/server/utils/utils";

type WrapperProps = {
    workspaceId: string;
};

export const Wrapper = async ({ workspaceId }: WrapperProps) => {
    const [workspaceResult, messagesResult] = await Promise.all([
        getWorkspaceById(workspaceId, DEV_USER_ID),
        getMessagesByWorkspace(workspaceId, DEV_USER_ID),
    ]);

    if (workspaceResult.error === SiteContent.workspaceNotFoundError) {
        notFound();
    }

    if (workspaceResult.error || !workspaceResult.data || !workspaceResult.success) {
        return <p className={styles.error}>{workspaceResult.error}</p>;
    }

    const workspace = workspaceResult.data;
    const initialMessages: InitialMessage[] = (messagesResult.success ? messagesResult.data : []).map(
        (message) => ({
            id: message.id,
            role: message.role === "USER" ? "user" : "assistant",
            parts: [{ type: "text", text: message.content }],
            citations: parseCitations((message as { citations?: unknown; }).citations as never),
        }),
    );

    return <WorkspaceShell workspace={workspace} workspaceId={workspaceId} initialMessages={initialMessages} messagesError={messagesResult.error} />;
};