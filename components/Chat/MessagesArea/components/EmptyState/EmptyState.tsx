"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { SiteContent } from "@/src/lib/content";
import { uploadDocument } from "@/src/server/actions/uploadDocument";
import styles from "./emptyState.module.css";

type EmptyStateProps = {
    workspaceId: string;
    isDemo?: boolean;
    onUploadSuccess?: () => void;
};

export const EmptyState = ({ workspaceId, isDemo = false, onUploadSuccess }: EmptyStateProps) => {
    const router = useRouter();
    const inputRef = useRef<HTMLInputElement>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const openFilePicker = () => {
        if (isUploading || isDemo) {
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

    return (
        <>
            <button type="button" className={styles.emptyState} onClick={openFilePicker} disabled={isUploading || isDemo}>
                <p className={styles.emptyStateTitle}>
                    {isUploading ? <Loader2 className={styles.spinner} aria-hidden="true" /> : SiteContent.firstQuestion}
                </p>
                {error ? <p className={styles.error}>{error}</p> : null}
                <p className={styles.emptyStateDescription}>{SiteContent.promptDescription}</p>
            </button>
            {!isDemo ? (
                <input
                    ref={inputRef}
                    className={styles.hiddenInput}
                    type="file"
                    accept="application/pdf"
                    onChange={handleFileChange}
                    disabled={isUploading}
                />
            ) : null}
        </>
    );
};
