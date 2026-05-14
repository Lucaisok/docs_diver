"use client";
import { useState } from "react";
import Button from "@/components/Button/Button";
import Input from "@/components/Input/Input";
import { createWorkspace } from "@/src/server/actions/createWorkspace";
import styles from "./CreateWorkspaceForm.module.css";
import { SiteContent } from "@/src/lib/content";

export const CreateWorkspaceForm = () => {
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (formData: FormData) => {
        const result = await createWorkspace(formData);

        if (result.success) {
            setError(null);
        } else {
            setError(result.error);
        }
    };

    return (
        <>
            <form action={handleSubmit} className={styles.form} onFocus={() => setError(null)}>
                <Input
                    name="name"
                    placeholder={SiteContent.namespace}
                    className={styles.input}
                />
                <Button type="submit" className={styles.primaryGlow}>
                    {SiteContent.create}
                </Button>
            </form>
            {error && <div className={styles.error}>{error}</div>}
        </>
    );
};