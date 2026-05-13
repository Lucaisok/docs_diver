import { SiteContent } from "@/src/lib/content";
import { routes } from "@/src/lib/routes";
import Link from "next/link";
import styles from "./AppShell.module.css";

type AppShellProps = {
    children: React.ReactNode;
};

export function AppShell({ children }: AppShellProps) {
    const content = SiteContent;

    return (
        <div className={styles.shell}>
            <header className={styles.header}>
                <div className={styles.headerInner}>
                    <Link href={routes.home} className={styles.brandLink}>
                        {content.title}
                    </Link>

                    <nav className={styles.nav}>
                        <Link href={routes.dashboard} className={styles.navLink}>
                            {content.dashboard}
                        </Link>
                    </nav>
                </div>
            </header>

            <main className={styles.main}>{children}</main>
        </div>
    );
}