"use client";
import Button from "@/components/Button/Button";
import styles from "./DocumentsSection.module.css";
import { SiteContent } from "@/src/lib/content";
import { WorkspaceDocument } from "@/src/types/workspace";
import { useRef, useState } from "react";
import { deleteDocument } from "@/src/server/actions/deleteDocument";
import { uploadDocument } from "@/src/server/actions/uploadDocument";
import { useRouter } from "next/navigation";
import { DeleteDocumentModal } from "./DeleteDocumentModal";
import { NoDocumentsState } from "./components/NoDocumentsState";
import { DocumentItem } from "./components/DocumentItem";
import { Loader2 } from "lucide-react";

interface DocumentsSectionProps {
    workspaceId: string;
    documents: WorkspaceDocument[];
    onUploadSuccess?: () => void;
}

export const DocumentsSection = ({ workspaceId, documents, onUploadSuccess }: DocumentsSectionProps) => {
    const router = useRouter();
    const inputRef = useRef<HTMLInputElement>(null);
    const [selectedDocument, setSelectedDocument] = useState<WorkspaceDocument | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const hasDocuments = documents.length > 0;

    const openFilePicker = () => {
        if (isUploading) {
            return;
        }

        setError(null);
        inputRef.current?.click();
    };

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = event.target.files?.[0];

        if (!selectedFile || isUploading) {
            event.target.value = "";
            return;
        }

        setIsUploading(true);
        setError(null);

        const formData = new FormData();
        formData.append("workspaceId", workspaceId);
        formData.append("file", selectedFile);

        const result = await uploadDocument(formData);

        if (!result.success) {
            setError(result.error ?? SiteContent.documentUploadError);
            setIsUploading(false);
            event.target.value = "";
            return;
        }

        event.target.value = "";
        setIsUploading(false);
        onUploadSuccess?.();
        router.refresh();
    };

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
            <Button className={styles.uploadButton} onClick={openFilePicker} disabled={isUploading}>
                {isUploading ? <Loader2 className={styles.spinnerIcon} aria-hidden="true" /> : SiteContent.uploadPDF}
            </Button>
            {error ? <p className={styles.error}>{error}</p> : null}
            <input
                ref={inputRef}
                className={styles.hiddenInput}
                type="file"
                accept="application/pdf"
                onChange={handleFileChange}
                disabled={isUploading}
            />
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