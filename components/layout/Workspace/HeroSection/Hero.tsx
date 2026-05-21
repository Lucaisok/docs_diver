import { Bot, Folder, Pen } from "lucide-react";
import styles from "./Hero.module.css";
import { SiteContent } from "@/src/lib/content";

interface HeroProps {
    workspaceName: string;
    documentsCount: number;
    openWorkspaceModal: () => void;
    openDocumentsModal: () => void;
    openUsageModal: () => void;
}

export const Hero = ({ workspaceName, documentsCount, openWorkspaceModal, openDocumentsModal, openUsageModal }: HeroProps) => {
    return <div className={styles.hero}>
        <div className={styles.content}>
            <h1 className={styles.title}>
                {workspaceName}
            </h1>
            <p className={styles.description}>
                {SiteContent.askQuestions}
            </p>
        </div>

        <div className={styles.actions}>
            <button
                type="button"
                className={styles.usageButton}
                onClick={openWorkspaceModal}
                aria-label={SiteContent.workspaceSettings}
                title={SiteContent.workspaceSettings}
            >
                <Pen className={styles.usageIcon} aria-hidden="true" />
            </button>

            <button
                type="button"
                className={styles.usageButton}
                onClick={openUsageModal}
                aria-label={SiteContent.aiUsage}
                title={SiteContent.aiUsage}
            >
                <Bot className={styles.usageIcon} aria-hidden="true" />
            </button>

            <button
                type="button"
                className={styles.usageButton}
                onClick={openDocumentsModal}
                aria-label={SiteContent.documents}
                title={SiteContent.documents}
            >
                <Folder className={styles.usageIcon} aria-hidden="true" />
                <span className={styles.countBadge} aria-hidden="true">{documentsCount}</span>
            </button>
        </div>
    </div>;

};