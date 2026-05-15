"use client";
import Button from "@/components/Button/Button";
import Input from "@/components/Input/Input";
import { uploadDocument } from "@/src/server/actions/uploadDocument";
import { useState } from "react";
import styles from "./uploadDocumentForm.module.css";
import { SiteContent } from "@/src/lib/content";
import { Loader2 } from "lucide-react";


type UploadDocumentFormProps = {
    workspaceId: string;
    onSuccess: () => void;
};

export function UploadDocumentForm({ workspaceId, onSuccess }: UploadDocumentFormProps) {
    const [error, setError] = useState<string | null>(null);
    const [isUploading, setIsUploading] = useState(false);

    const handleFormSubmission = async (formData: FormData) => {
        if (isUploading) {
            return;
        }

        setIsUploading(true);
        const result = await uploadDocument(formData);

        if (result.success) {
            setError(null);
            onSuccess();
        } else {
            setError(result.error);
        }

        setIsUploading(false);
    };

    return (
        <> <form action={handleFormSubmission} className={styles.form} onFocus={() => setError(null)}>
            <input type="hidden" name="workspaceId" value={workspaceId} />
            <Input name="file" type="file" accept="application/pdf" disabled={isUploading} />
            <Button type="submit" className={styles.submit} disabled={isUploading}>
                <span className={styles.buttonContent}>
                    {isUploading && <Loader2 className={styles.spinnerIcon} aria-hidden="true" />}
                    {isUploading ? SiteContent.uploading : SiteContent.uploadPDF}
                </span>
            </Button>
        </form>
            {error && <div className={styles.error}>{error}</div>}
        </>

    );
}