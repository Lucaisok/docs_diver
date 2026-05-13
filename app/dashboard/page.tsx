import Link from "next/link";
import { AppShell } from "@/components/AppShell/AppShell";
import Card from "@/components/Card/Card";
import styles from "./page.module.css";
import Button from "@/components/Button/Button";
import { SiteContent } from "@/src/lib/content";
import { routes } from "@/src/lib/routes";

const mockWorkspaces = [
    {
        id: "workspace-1",
        name: "React Native Architecture Docs",
        documents: 3,
        updatedAt: "Today",
    },
    {
        id: "workspace-2",
        name: "AI Research Papers",
        documents: 7,
        updatedAt: "Yesterday",
    },
];

export default function DashboardPage() {
    const content = SiteContent;

    return (
        <AppShell>
            <div className={styles.header}>
                <div>
                    <h1 className={styles.title}>{content.workspaces}</h1>
                    <p className={styles.subtitle}>
                        {content.workspacesDescription}
                    </p>
                </div>

                <Button>{content.newWorkspace}</Button>
            </div>

            <div className={styles.grid}>
                {mockWorkspaces.map((workspace) => (
                    <Link
                        key={workspace.id}
                        href={routes.workspace(workspace.id)}
                        className={styles.cardLink}
                    >
                        <Card title={workspace.name}>
                            <div className={styles.meta}>
                                <p className={styles.documents}>{workspace.documents} {content.documents}</p>
                                <p className={styles.updated}>{content.updated} {workspace.updatedAt}</p>
                            </div>
                        </Card>
                    </Link>
                ))}
            </div>
        </AppShell>
    );
}