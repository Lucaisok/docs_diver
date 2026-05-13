import Card from "@/components/Card/Card";
import styles from "./EmptyDashboardCard.module.css";
import { SiteContent } from "@/src/lib/content";

export const EmptyDashboardCard = () => {
    return (
        <Card className={styles.card}>
            <p className={styles.title}>{SiteContent.noWorkspacesDescription}</p>
            <p className={styles.description}>
                {SiteContent.noWorkspacesTitle}
            </p>
        </Card>
    );
};