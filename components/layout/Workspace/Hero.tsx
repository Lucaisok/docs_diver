import Button from "@/components/Button/Button";
import styles from "./Hero.module.css";
import { SiteContent } from "@/src/lib/content";

export const Hero = () => {
    return <div className={styles.hero}>
        <div className={styles.content}>
            <h1 className={styles.title}>
                React Native Architecture Docs
            </h1>
            <p className={styles.description}>
                {SiteContent.askQuestions}
            </p>
        </div>

        <Button>{SiteContent.uploadPDF}</Button>
    </div>;

};