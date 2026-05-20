import { SiteContent } from "@/src/lib/content";
import styles from "./QASection.module.css";

type QASectionProps = {
    question: string;
    answer: string;
};

export function QASection({ question, answer }: QASectionProps) {
    return (
        <div className={styles.qaSection}>
            <div className={styles.qaBlock}>
                <p className={styles.qaLabel}>{SiteContent.question}</p>
                <p className={styles.qaText}>{question}</p>
            </div>
            <div className={styles.qaBlock}>
                <p className={styles.qaLabel}>{SiteContent.answer}</p>
                <p className={styles.qaText}>{answer}</p>
            </div>
        </div>
    );
}
