import { SiteContent } from "@/src/lib/content";
import { Loader2 } from "lucide-react";
import styles from "./loadingState.module.css";

export const LoadingState = () => {
    return (
        <div className={`${styles.messageRow} ${styles.assistantMessageRow}`}>
            <div className={styles.loadingState} aria-live="polite" aria-label={SiteContent.thinking}>
                <Loader2 className={styles.loadingIcon} aria-hidden="true" />
                <span>{SiteContent.thinking}</span>
            </div>
        </div>
    );
};
