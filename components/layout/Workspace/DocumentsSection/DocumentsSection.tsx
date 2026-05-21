"use client";
import Button from "@/components/Button/Button";
import styles from "./DocumentsSection.module.css";
import { SiteContent } from "@/src/lib/content";
import { WorkspaceDocument } from "@/src/types/workspace";
import { useMemo, useState } from "react";
import { deleteDocument } from "@/src/server/actions/deleteDocument";
import { useRouter } from "next/navigation";
import { DeleteDocumentModal } from "./DeleteDocumentModal";
import { NoDocumentsState } from "./components/NoDocumentsState";
import { DocumentItem } from "./components/DocumentItem";

interface DocumentsSectionProps {
    documents: WorkspaceDocument[];
    openModal: () => void;
}

export const DocumentsSection = ({ documents, openModal }: DocumentsSectionProps) => {
    const router = useRouter();
    const [selectedDocument, setSelectedDocument] = useState<WorkspaceDocument | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const workspaceId = useMemo(() => documents[0]?.workspaceId ?? "", [documents]);
    const hasDocuments = documents.length > 0;

    const handleDeleteDocument = async () => {
        if (!selectedDocument || !workspaceId || isDeleting) {
            return;
        }

        setIsDeleting(true);
        setError(null);

        const result = await deleteDocument(selectedDocument.id, workspaceId);

        if (!result.success) {
            setError(result.error ?? SiteContent.documentDeleteError);
            setIsDeleting(false);
            return;
        }

        setSelectedDocument(null);
        setIsDeleting(false);
        router.refresh();
    };

    return <>
        <div className={styles.documentsBody}>
            {!hasDocuments ?
                <NoDocumentsState />
                : <div className={styles.documentsList}>
                    {documents.map((document) => (
                        <DocumentItem
                            key={document.id}
                            document={document}
                            onDeleteClick={(targetDocument) => {
                                setError(null);
                                setSelectedDocument(targetDocument);
                            }}
                        />
                    ))}
                </div>
            }
            <Button className={styles.uploadButton} onClick={openModal}>{SiteContent.uploadPDF}</Button>
        </div>

        <DeleteDocumentModal
            isOpen={Boolean(selectedDocument)}
            documentName={selectedDocument?.name ?? null}
            isDeleting={isDeleting}
            error={error}
            onClose={() => {
                if (isDeleting) return;
                setSelectedDocument(null);
                setError(null);
            }}
            onCancel={() => {
                setSelectedDocument(null);
                setError(null);
            }}
            onConfirm={handleDeleteDocument}
        />
    </>;
};