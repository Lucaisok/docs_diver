import Button from "@/components/Button/Button";
import { SiteContent } from "@/src/lib/content";
import styles from "./hero.module.css";

interface HeroProps {
    openModal: () => void;
}

export const Hero = ({ openModal }: HeroProps) => {
    return <div className={styles.header}>
        <div>
            <h1 className={styles.title}>{SiteContent.workspaces}</h1>
            <p className={styles.subtitle}>
                {SiteContent.workspacesDescription}
            </p>
        </div>
        <Button onClick={openModal}>{SiteContent.newWorkspace}</Button>
    </div>;
};