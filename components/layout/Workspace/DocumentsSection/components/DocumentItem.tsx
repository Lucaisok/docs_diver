import { Trash2 } from "lucide-react";
import { SiteContent } from "@/src/lib/content";
import { WorkspaceDocument } from "@/src/types/workspace";
import styles from "./documentItem.module.css";

type DocumentItemProps = {
    document: WorkspaceDocument;
    onDeleteClick: (document: WorkspaceDocument) => void;
};

export const DocumentItem = ({ document, onDeleteClick }: DocumentItemProps) => {
    return (
        <div className={styles.documentRow}>
            <div>
                <p className={styles.documentName}>{document.name}</p>
                <p className={styles.documentMeta}>
                    {SiteContent.status}: {document.status.toLowerCase()} | {document._count.chunks} {SiteContent.chunks}
                </p>
            </div>
            <button
                type="button"
                className={styles.deleteIconButton}
                aria-label={SiteContent.deleteDocument}
                title={SiteContent.deleteDocument}
                onClick={() => onDeleteClick(document)}
            >
                <Trash2 className={styles.deleteIcon} aria-hidden="true" />
            </button>
        </div>
    );
};
