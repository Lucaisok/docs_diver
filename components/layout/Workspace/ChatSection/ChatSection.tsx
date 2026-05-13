import Button from "@/components/Button/Button";
import Card from "@/components/Card/Card";
import styles from "./ChatSection.module.css";
import { SiteContent } from "@/src/lib/content";

export const ChatSection = () => {
    return <Card title={SiteContent.chat}>
        <div className={styles.content}>
            <div className={styles.promptBox}>
                <p className={styles.promptTitle}>{SiteContent.firstQuestion}</p>
                <p className={styles.promptDescription}>
                    {SiteContent.promptDescription}
                </p>
            </div>
        </div>

        <div className={styles.footer}>
            <div className={styles.inputRow}>
                <input
                    disabled
                    placeholder={SiteContent.questionPlaceholder}
                    className={styles.input}
                />
                <Button disabled>{SiteContent.ask}</Button>
            </div>
        </div>
    </Card>;
};