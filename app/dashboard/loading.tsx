import styles from "./loading.module.css";

export default function Loading() {
    return (
        <main className={styles.page} aria-busy="true" aria-live="polite">
            <section className={styles.panel}>
                <div className={styles.spinner} aria-hidden="true" />
                <div className={styles.copy}>
                    <p className={styles.title}>Preparing your workspace</p>
                    <p className={styles.description}>
                        We are creating your demo workspace and indexing the example PDF.
                        This can take a few moments on first load.
                    </p>
                </div>
            </section>
        </main>
    );
}