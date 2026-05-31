import Button from "@/components/Button/Button";
import Link from "next/link";
import styles from "./page.module.css";
import { SiteContent } from "@/src/lib/content";
import { routes } from "@/src/lib/routes";

export default function HomePage() {

  return (
    <main className={styles.main}>
      <div className={styles.container}>
        <h1 className={styles.heading}>
          {SiteContent.title}
        </h1>

        <p className={styles.description}>
          {SiteContent.description}
        </p>

        <div className={styles.actions}>
          <Button>
            <Link href={routes.dashboard} className={styles.link}>{SiteContent.dashboard}</Link>
          </Button>
        </div>
      </div>
    </main>
  );
}