import Card from "@/components/Card/Card";
import styles from "./EmptyDashboardCard.module.css";
import { SiteContent } from "@/src/lib/content";

interface EmptyDashboardCardProps {
    onClick?: () => void;
}

export const EmptyDashboardCard = ({ onClick }: EmptyDashboardCardProps) => {
    return (
        <Card
            className={styles.card}
            role="button"
            tabIndex={0}
            onClick={onClick}
            onKeyDown={(event) => {
                if ((event.key === "Enter" || event.key === " ") && onClick) {
                    event.preventDefault();
                    onClick();
                }
            }}
        >
            <div className={styles.content}>
                <p className={styles.title}>{SiteContent.noWorkspacesDescription}</p>
                <p className={styles.description}>{SiteContent.noWorkspacesTitle}</p>
            </div>
        </Card>
    );
};