import Button from "@/components/Button/Button";
import Modal from "@/components/Modal/Modal";
import { SiteContent } from "@/src/lib/content";
import { Loader2 } from "lucide-react";
import styles from "./deleteWorkspaceModal.module.css";

type DeleteWorkspaceModalProps = {
    isOpen: boolean;
    isDeleting: boolean;
    error: string | null;
    onClose: () => void;
    onCancel: () => void;
    onConfirm: () => void;
};

export const DeleteWorkspaceModal = ({
    isOpen,
    isDeleting,
    error,
    onClose,
    onCancel,
    onConfirm,
}: DeleteWorkspaceModalProps) => {
    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={SiteContent.confirmDeleteWorkspaceTitle}
            description={SiteContent.confirmDeleteWorkspaceDescription}
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
                    <span className={styles.buttonContent}>
                        {isDeleting ? <Loader2 className={styles.spinnerIcon} aria-hidden="true" /> : null}
                        {SiteContent.deleteWorkspace}
                    </span>
                </Button>
            </div>
            {error ? <p className={styles.deleteError}>{error}</p> : null}
        </Modal>
    );
};
