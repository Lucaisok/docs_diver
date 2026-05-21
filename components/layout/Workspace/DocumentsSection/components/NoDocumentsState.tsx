import { SiteContent } from "@/src/lib/content";
import styles from "./noDocumentsState.module.css";

export const NoDocumentsState = () => {
    return (
        <div className={styles.emptyState}>
            <p className={styles.title}>{SiteContent.noDocumentsTitle}</p>
            <p className={styles.description}>
                {SiteContent.noDocumentsDescription}
            </p>
        </div>
    );
};
