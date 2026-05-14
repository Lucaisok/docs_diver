"use client";
import Button from "@/components/Button/Button";
import Input from "@/components/Input/Input";
import { uploadDocument } from "@/src/server/actions/documents";
import { useState } from "react";
import styles from "./uploadDocumentForm.module.css";
import { SiteContent } from "@/src/lib/content";


type UploadDocumentFormProps = {
    workspaceId: string;
};

export function UploadDocumentForm({ workspaceId }: UploadDocumentFormProps) {
    const [error, setError] = useState<string | null>(null);

    const handleFormSubmission = async (formData: FormData) => {
        const result = await uploadDocument(formData);
        if (result.success) {
            setError(null);
        } else {
            setError(result.error);
        }
    };
    return (
        <> <form action={handleFormSubmission} className={styles.form}>
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