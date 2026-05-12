import Link from "next/link";

type AppShellProps = {
    children: React.ReactNode;
};

export function AppShell({ children }: AppShellProps) {
    return (
        <div className="min-h-screen bg-background">
            <header className="border-b">
                <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
                    <Link href="/dashboard" className="font-semibold tracking-tight">
                        Knowledge Workspace
                    </Link>

                    <nav className="flex items-center gap-4 text-sm text-muted-foreground">
                        <Link href="/dashboard">Dashboard</Link>
                    </nav>
                </div>
            </header>

            <main className="mx-auto max-w-6xl px-6 py-8">{children}</main>
        </div>
    );
}