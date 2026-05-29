import { getWorkspacesByUserId } from "@/src/server/queries/workspaces";
import { DashboardShell } from "./DashboardShell";
import { getCurrentUserIdOrRedirect } from "@/src/server/auth/session-user";

export const Wrapper = async () => {
    const userId = await getCurrentUserIdOrRedirect("/dashboard");
    const result = await getWorkspacesByUserId(userId);

    return <DashboardShell workspaces={result.data} workspacesError={result.error} />;
};