import { SiteContent } from "@/src/lib/content";
import styles from "./emptyState.module.css";

export const EmptyState = () => {
    return (
        <div className={styles.emptyState}>
            <p className={styles.emptyStateTitle}>{SiteContent.firstQuestion}</p>
            <p className={styles.emptyStateDescription}>{SiteContent.promptDescription}</p>
        </div>
    );
};
