import styles from "./loading.module.css";

export default function Loading() {
    return (
        <main className={styles.page} aria-busy="true" aria-live="polite">
            <section className={styles.hero}>
                <div className={styles.titleSkeleton} />
                <div className={styles.textSkeleton} />
            </section>

            <section className={styles.grid}>
                <div className={styles.cardSkeleton} />
                <div className={styles.cardSkeleton} />
                <div className={styles.cardSkeleton} />
            </section>
        </main>
    );
}