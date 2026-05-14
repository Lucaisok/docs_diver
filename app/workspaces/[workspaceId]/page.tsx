import { AppShell } from "@/components/AppShell/AppShell";
import { Wrapper } from "@/components/layout/Workspace/Wrapper/Wrapper";

type WorkspacePage = {
    params: Promise<{
        workspaceId: string;
    }>;
};

export const WorkspacePage = async ({ params }: WorkspacePage) => {
    const { workspaceId } = await params;

    return (
        <AppShell>
            <Wrapper workspaceId={workspaceId} />
        </AppShell>
    );
};

export default WorkspacePage;