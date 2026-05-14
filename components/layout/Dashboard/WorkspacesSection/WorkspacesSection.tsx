import { EmptyDashboardCard } from "../EmptyDashboardCard/EmptyDashboardCard";
import styles from "./workspacesSection.module.css";
import { WorkspaceCard } from "../WorkspaceCard/WorkspaceCard";
import { getWorkspacesByUserId } from "@/src/server/queries/workspaces";

interface WorkspacesSectionProps {
    workspaces: Awaited<ReturnType<typeof getWorkspacesByUserId>>;
}

export const WorkspacesSection = ({ workspaces }: WorkspacesSectionProps) => {

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