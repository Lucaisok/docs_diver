import Link from "next/link";
import styles from "./not-found.module.css";
import { routes } from "@/src/lib/routes";

export default function NotFound() {
    return (
        <main className={styles.page}>
            <section className={styles.card}>
                <p className={styles.code}>404</p>
                <h1 className={styles.title}>Page Not Found</h1>
                <p className={styles.description}>
                    The page you are looking for does not exist or is no longer available.
                </p>
                <div className={styles.actions}>
                    <Link href={routes.dashboard} className={styles.primaryAction}>
                        Go To Dashboard
                    </Link>
                    <Link href={routes.home} className={styles.secondaryAction}>
                        Back To Home
                    </Link>
                </div>
            </section>
        </main>
    );
}