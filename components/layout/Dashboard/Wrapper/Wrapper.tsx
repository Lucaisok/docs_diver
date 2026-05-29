import { getWorkspacesByUserId } from "@/src/server/queries/workspaces";
import { DashboardShell } from "./DashboardShell";
import { getCurrentUserId } from "@/src/server/auth/session-user";

export const Wrapper = async () => {
    const userId = await getCurrentUserId();
    const result = await getWorkspacesByUserId(userId);

    return <DashboardShell workspaces={result.data} workspacesError={result.error} />;
};