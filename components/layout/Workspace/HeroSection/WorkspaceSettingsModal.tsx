"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Button from "@/components/Button/Button";
import Input from "@/components/Input/Input";
import Modal from "@/components/Modal/Modal";
import { SiteContent } from "@/src/lib/content";
import { renameWorkspace } from "@/src/server/actions/renameWorkspace";
import { deleteWorkspace } from "@/src/server/actions/deleteWorkspace";
import { DeleteWorkspaceModal } from "./DeleteWorkspaceModal";
import styles from "./workspaceSettingsModal.module.css";

type WorkspaceSettingsModalProps = {
    isOpen: boolean;
    workspaceId: string;
    workspaceName: string;
    isDemo: boolean;
    onClose: () => void;
};

export const WorkspaceSettingsModal = ({
    isOpen,
    workspaceId,
    workspaceName,
    isDemo,
    onClose,
}: WorkspaceSettingsModalProps) => {
    const router = useRouter();

    const [name, setName] = useState(workspaceName);
    const [error, setError] = useState<string | null>(null);
    const [isRenaming, setIsRenaming] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    useEffect(() => {
        setName(workspaceName);
        setError(null);
        setIsDeleteModalOpen(false);
        setIsDeleting(false);
        setIsRenaming(false);
    }, [workspaceName, isOpen]);

    const handleRename = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (isRenaming) {
            return;
        }

        setIsRenaming(true);
        setError(null);

        const result = await renameWorkspace(workspaceId, name);

        if (!result.success) {
            setError(result.error ?? SiteContent.workspaceRenameError);
            setIsRenaming(false);
            return;
        }

        setIsRenaming(false);
        onClose();
        router.refresh();
    };

    const handleDelete = async () => {
        if (isDeleting) {
            return;
        }

        setIsDeleting(true);
        setError(null);

        const result = await deleteWorkspace(workspaceId);

        if (!result.success) {
            setError(result.error ?? SiteContent.workspaceDeleteError);
            setIsDeleting(false);
            return;
        }

        setIsDeleting(false);
        setIsDeleteModalOpen(false);
        onClose();
        router.push("/dashboard");
        router.refresh();
    };

    return (
        <>
            <Modal
                isOpen={isOpen}
                onClose={() => {
                    if (isRenaming || isDeleting) return;
                    onClose();
                }}
                title={SiteContent.workspaceSettings}
                description={SiteContent.workspaceSettingsDescription}
            >
                <form className={styles.form} onSubmit={handleRename}>
                    <Input
                        value={name}
                        onChange={(event) => {
                            setName(event.target.value);
                            if (error) {
                                setError(null);
                            }
                        }}
                        placeholder={SiteContent.namespace}
                        disabled={isRenaming || isDeleting || isDemo}
                    />
                    {!isDemo ? (
                        <div className={styles.actions}>
                            <Button type="submit" disabled={isRenaming || isDeleting}>
                                {SiteContent.renameWorkspace}
                            </Button>
                            <Button
                                type="button"
                                variant="secondary"
                                className={styles.deleteButton}
                                onClick={() => setIsDeleteModalOpen(true)}
                                disabled={isRenaming || isDeleting}
                            >
                                {SiteContent.deleteWorkspace}
                            </Button>
                        </div>
                    ) : null}
                </form>
                {error ? <p className={styles.error}>{error}</p> : null}
            </Modal>

            <DeleteWorkspaceModal
                isOpen={isDeleteModalOpen}
                isDeleting={isDeleting}
                error={error}
                onClose={() => {
                    if (isDeleting) return;
                    setIsDeleteModalOpen(false);
                    setError(null);
                }}
                onCancel={() => {
                    setIsDeleteModalOpen(false);
                    setError(null);
                }}
                onConfirm={handleDelete}
            />
        </>
    );
};
