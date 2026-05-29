import { AppShell } from "@/components/AppShell/AppShell";
import { DEV_USER_ID } from "@/src/lib/dev-user";
import { getAIRequestLogs } from "@/src/server/queries/ai-request-logs";
import { SiteContent } from "@/src/lib/content";
import styles from "./page.module.css";
import { AIUsagePanel } from "@/components/AIUsagePanel/AIUsagePanel";


type EvalPageProps = {
    params: Promise<{
        workspaceId: string;
    }>;
};

export default async function EvalPage({ params }: EvalPageProps) {
    const { workspaceId } = await params;
    const logs = await getAIRequestLogs(workspaceId, DEV_USER_ID);

    return (
        <AppShell>
            <div className={styles.container}>
                <div className={styles.header}>
                    <h1 className={styles.title}>
                        {SiteContent.evalTitle}
                    </h1>
                    <p className={styles.description}>
                        {SiteContent.evalDescription}
                    </p>
                </div>

                <div className={styles.logsList}>
                    {logs.map((log) => (
                        <AIUsagePanel log={log} />
                    ))}
                </div>
            </div>
        </AppShell>
    );
}