import { getWorkspaceById } from "@/src/server/queries/workspaces";
import styles from "./wrapper.module.css";
import { DEV_USER_ID } from "@/src/lib/dev-user";
import { WorkspaceShell } from "../WorkspaceShell/WorkspaceShell";

type WrapperProps = {
    workspaceId: string;
};

export const Wrapper = async ({ workspaceId }: WrapperProps) => {
    const result = await getWorkspaceById(workspaceId, DEV_USER_ID);

    if (result.error || !result.data || !result.success) {
        return <p className={styles.error}>{result.error}</p>;
    }

    const workspace = result.data;

    return <WorkspaceShell workspace={workspace} workspaceId={workspaceId} />;
};