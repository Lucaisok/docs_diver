import Link from "next/link";
import { AppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

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
    return (
        <AppShell>
            <div className="mb-8 flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-semibold tracking-tight">Workspaces</h1>
                    <p className="mt-2 text-muted-foreground">
                        Organize documents, ask questions, and generate grounded answers.
                    </p>
                </div>

                <Button>New workspace</Button>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
                {mockWorkspaces.map((workspace) => (
                    <Link key={workspace.id} href={`/workspaces/${workspace.id}`}>
                        <Card className="transition hover:bg-muted/50 surface surface-hover soft-panel">
                            <CardHeader>
                                <CardTitle>{workspace.name}</CardTitle>
                            </CardHeader>

                            <CardContent className="text-sm text-muted-foreground">
                                <p>{workspace.documents} documents</p>
                                <p>Updated {workspace.updatedAt}</p>
                            </CardContent>
                        </Card>
                    </Link>
                ))}
            </div>
        </AppShell>
    );
}