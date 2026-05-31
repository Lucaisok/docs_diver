import Link from "next/link";
import styles from "./not-found.module.css";
import { routes } from "@/src/lib/routes";
import { SiteContent } from "@/src/lib/content";

export default function NotFound() {
    return (
        <main className={styles.page}>
            <section className={styles.card}>
                <p className={styles.code}>{SiteContent.notFoundCode}</p>
                <h1 className={styles.title}>{SiteContent.notFoundTitle}</h1>
                <p className={styles.description}>
                    {SiteContent.notFoundDescription}
                </p>
                <div className={styles.actions}>
                    <Link href={routes.dashboard} className={styles.primaryAction}>
                        {SiteContent.goToDashboard}
                    </Link>
                    <Link href={routes.home} className={styles.secondaryAction}>
                        {SiteContent.backToHome}
                    </Link>
                </div>
            </section>
        </main>
    );
}