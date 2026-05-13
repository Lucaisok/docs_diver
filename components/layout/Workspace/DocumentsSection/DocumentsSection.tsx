import Button from "@/components/Button/Button";
import Card from "@/components/Card/Card";
import styles from "./DocumentsSection.module.css";
import { SiteContent } from "@/src/lib/content";

export const DocumentsSection = () => {
    return <Card title={SiteContent.documents}>
        <div className={styles.emptyState}>
            <p className={styles.title}>{SiteContent.noDocumentsTitle}</p>
            <p className={styles.description}>
                {SiteContent.noDocumentsDescription}
            </p>
            <Button className={styles.cta}>{SiteContent.uploadPDF}</Button>
        </div>
    </Card>;
};