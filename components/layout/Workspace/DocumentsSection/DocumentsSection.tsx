import Button from "@/components/Button/Button";
import Card from "@/components/Card/Card";
import styles from "./DocumentsSection.module.css";
import { SiteContent } from "@/src/lib/content";
import { WorkspaceDocument } from "@/src/types/workspace";

interface DocumentsSectionProps {
    documents: WorkspaceDocument[];
    openModal: () => void;
}

export const DocumentsSection = ({ documents, openModal }: DocumentsSectionProps) => {
    const hasDocuments = documents.length > 0;
    return <Card title={SiteContent.documents}>
        {!hasDocuments ?
            <div className={styles.emptyState}>
                <p className={styles.title}>{SiteContent.noDocumentsTitle}</p>
                <p className={styles.description}>
                    {SiteContent.noDocumentsDescription}
                </p>
                <Button className={styles.cta} onClick={openModal}>{SiteContent.uploadPDF}</Button>
            </div>
            : <div className={styles.documentsList}>
                {documents.map((document) => (
                    <div
                        key={document.id}
                        className={styles.documentRow}
                    >
                        <p className={styles.documentName}>{document.name}</p>
                        <p className={styles.documentMeta}>
                            {SiteContent.status}: {document.status.toLowerCase()} | {document._count.chunks} {SiteContent.chunks}
                        </p>
                    </div>
                ))}
            </div>
        }
    </Card>;
};