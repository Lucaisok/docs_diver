import Button from "@/components/Button/Button";
import Modal from "@/components/Modal/Modal";
import { SiteContent } from "@/src/lib/content";
import styles from "./deleteDocumentModal.module.css";

type DeleteDocumentModalProps = {
    isOpen: boolean;
    documentName: string | null;
    isDeleting: boolean;
    error: string | null;
    onClose: () => void;
    onCancel: () => void;
    onConfirm: () => void;
};

export const DeleteDocumentModal = ({
    isOpen,
    documentName,
    isDeleting,
    error,
    onClose,
    onCancel,
    onConfirm,
}: DeleteDocumentModalProps) => {
    const description = documentName
        ? `${SiteContent.confirmDeleteDocumentDescription} ${documentName}`
        : SiteContent.confirmDeleteDocumentDescription;

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={SiteContent.confirmDeleteDocumentTitle}
            description={description}
        >
            <div className={styles.confirmActions}>
                <Button
                    type="button"
                    variant="secondary"
                    onClick={onCancel}
                    disabled={isDeleting}
                >
                    {SiteContent.cancel}
                </Button>
                <Button
                    type="button"
                    onClick={onConfirm}
                    disabled={isDeleting}
                >
                    {SiteContent.deleteDocument}
                </Button>
            </div>
            {error ? <p className={styles.deleteError}>{error}</p> : null}
        </Modal>
    );
};
