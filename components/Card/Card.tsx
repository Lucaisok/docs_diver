import type { HTMLAttributes, ReactNode } from "react";
import styles from "./Card.module.css";
import { joinClasses } from "@/src/lib/utils";

type CardProps = Omit<HTMLAttributes<HTMLDivElement>, "title"> & {
    title?: ReactNode;
    footer?: ReactNode;
};

const Card = ({ title, footer, children, className, ...props }: CardProps) => {
    return (
        <article className={joinClasses(styles.card, className)} {...props}>
            {title ? (
                <header className={styles.header}>
                    <h3 className={styles.title}>{title}</h3>
                </header>
            ) : null}

            <div className={styles.body}>{children}</div>

            {footer ? <footer className={styles.footer}>{footer}</footer> : null}
        </article>
    );
};

export default Card;
