import { DEV_USER_ID } from "@/src/lib/dev-user";
import { getWorkspacesByUserId } from "@/src/server/queries/workspaces";
import { EmptyDashboardCard } from "../EmptyDashboardCard/EmptyDashboardCard";
import styles from "./workspacesSection.module.css";
import { WorkspaceCard } from "../WorkspaceCard/WorkspaceCard";

export const WorkspacesSection = async () => {
    const workspaces = await getWorkspacesByUserId(DEV_USER_ID);

    return (
        <div className={styles.grid}>
            {workspaces.length === 0
                ? <EmptyDashboardCard />
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