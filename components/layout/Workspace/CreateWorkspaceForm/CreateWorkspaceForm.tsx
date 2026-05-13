import Button from "@/components/Button/Button";
import Input from "@/components/Input/Input";
import { createWorkspace } from "@/src/server/actions/createWorkspace";
import styles from "./CreateWorkspaceForm.module.css";
import { SiteContent } from "@/src/lib/content";
export const CreateWorkspaceForm = () => {

    return (
        <form action={createWorkspace} className={styles.form}>
            <Input
                name="name"
                placeholder={SiteContent.namespace}
                className={styles.input}
            />
            <Button type="submit" className={styles.primaryGlow}>
                {SiteContent.create}
            </Button>
        </form>
    );
};