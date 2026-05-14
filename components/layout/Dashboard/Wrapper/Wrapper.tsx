import { getWorkspacesByUserId } from "@/src/server/queries/workspaces";
import { DEV_USER_ID } from "@/src/lib/dev-user";
import { DashboardShell } from "./DashboardShell";

export const Wrapper = async () => {
    const workspaces = await getWorkspacesByUserId(DEV_USER_ID);

    return <DashboardShell workspaces={workspaces} />;
};