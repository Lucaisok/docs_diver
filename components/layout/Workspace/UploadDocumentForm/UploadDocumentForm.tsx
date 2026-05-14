"use client";
import Button from "@/components/Button/Button";
import Input from "@/components/Input/Input";
import { uploadDocument } from "@/src/server/actions/documents";
import { useState } from "react";
import styles from "./uploadDocumentForm.module.css";
import { SiteContent } from "@/src/lib/content";


type UploadDocumentFormProps = {
    workspaceId: string;
    onSuccess: () => void;
};

export function UploadDocumentForm({ workspaceId, onSuccess }: UploadDocumentFormProps) {
    const [error, setError] = useState<string | null>(null);

    const handleFormSubmission = async (formData: FormData) => {
        const result = await uploadDocument(formData);
        if (result.success) {
            setError(null);
            onSuccess();
        } else {
            setError(result.error);
        }
    };
    return (
        <> <form action={handleFormSubmission} className={styles.form} onFocus={() => setError(null)}>
            <input type="hidden" name="workspaceId" value={workspaceId} />
            <Input name="file" type="file" accept="application/pdf" />
            <Button type="submit" className={styles.submit}>
                {SiteContent.uploadPDF}
            </Button>
        </form>
            {error && <div className={styles.error}>{error}</div>}
        </>

    );
}