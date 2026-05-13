import Card from "@/components/Card/Card";
import { SiteContent } from "@/src/lib/content";
import { routes } from "@/src/lib/routes";
import Link from "next/link";
import styles from "./workspaceCard.module.css";

interface WorkspaceCardProps {
    id: string;
    name: string;
    documentsCount: number;
    lastUpdate: string;
}

export const WorkspaceCard = ({ id, name, documentsCount, lastUpdate }: WorkspaceCardProps) => {
    return <Link
        key={id}
        href={routes.workspace(id)}
        className={styles.cardLink}
    >
        <Card title={name}>
            <div className={styles.meta}>
                <p className={styles.documents}>{documentsCount} {SiteContent.documents}</p>
                <p className={styles.updated}>{SiteContent.updated} {lastUpdate}</p>
            </div>
        </Card>
    </Link>;
};