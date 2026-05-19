import Button from "@/components/Button/Button";
import styles from "./Hero.module.css";
import { SiteContent } from "@/src/lib/content";

interface HeroProps {
    workspaceName: string;
    documentsNumber: number;
    openModal: () => void;
}

export const Hero = ({ workspaceName, documentsNumber, openModal }: HeroProps) => {
    return <div className={styles.hero}>
        <div className={styles.content}>
            <h1 className={styles.title}>
                {workspaceName}
            </h1>
            <p className={styles.subtitle}>
                {documentsNumber} {SiteContent.documents}
            </p>
            <p className={styles.description}>
                {SiteContent.askQuestions}
            </p>
        </div>

        <Button onClick={openModal}>{SiteContent.uploadPDF}</Button>
    </div>;

};