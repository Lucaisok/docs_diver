import { EmptyDashboardCard } from "../EmptyDashboardCard/EmptyDashboardCard";
import styles from "./workspacesSection.module.css";
import { WorkspaceCard } from "../WorkspaceCard/WorkspaceCard";
import { GetWorkspacesByUserIdResult } from "@/src/server/queries/workspaces";

interface WorkspacesSectionProps {
    workspaces: GetWorkspacesByUserIdResult["data"];
    error: string | null;
    onCreateWorkspace: () => void;
}

export const WorkspacesSection = ({ workspaces, error, onCreateWorkspace }: WorkspacesSectionProps) => {

    if (error || !workspaces) {
        return <p className={styles.error}>{error}</p>;
    }

    return (
        <div className={styles.grid}>
            {workspaces.length === 0
                ? <EmptyDashboardCard onClick={onCreateWorkspace} />
                : workspaces.map((workspace) => (
                    <WorkspaceCard key={workspace.id} id={workspace.id} name={workspace.name} documentsCount={workspace._count.documents} lastUpdate={workspace.updatedAt.toLocaleDateString("en-GB", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric"
                    })} />
                ))
            }
        </div>
    );
};