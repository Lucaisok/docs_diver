"use client";

import { JSX, useEffect, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import Button from "@/components/Button/Button";
import { joinClasses } from "@/src/lib/utils";
import styles from "./Modal.module.css";
import { SiteContent } from "@/src/lib/content";

type ModalProps = {
    isOpen: boolean;
    onClose: () => void;
    title?: ReactNode;
    description?: ReactNode;
    children: ReactNode;
    className?: string;
};

const ModalTitle = ({ title }: { title?: ReactNode; }) => title ? (
    <h2 id="modal-title" className={styles.title}>
        {title}
    </h2>
) : <></>;

const ModalDescription = ({ description }: { description?: ReactNode; }) => description ? (
    <p id="modal-description" className={styles.description}>
        {description}
    </p>
) : <></>;

export const Modal = ({
    isOpen,
    onClose,
    title,
    description,
    children,
    className,
}: ModalProps) => {
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    useEffect(() => {
        if (!isOpen) {
            return;
        }
        const onKeyDown = (event: KeyboardEvent) => {
            if (event.key === "Escape") {
                onClose();
            }
        };
        window.addEventListener("keydown", onKeyDown);

        return () => {
            window.removeEventListener("keydown", onKeyDown);
        };
    }, [isOpen, onClose]);

    if (!isOpen) {
        return null;
    }

    if (!isMounted) {
        return null;
    }

    return createPortal(
        <div className={styles.overlay} onClick={onClose} role="presentation">
            <div
                className={joinClasses(styles.modal, className)}
                onClick={(event) => event.stopPropagation()}
                role="dialog"
                aria-modal="true"
                aria-labelledby={title ? "modal-title" : undefined}
                aria-describedby={description ? "modal-description" : undefined}
            >
                <div className={styles.header}>
                    <div>
                        <ModalTitle title={title} />
                        <ModalDescription description={description} />
                    </div>
                    <Button type="button" variant="tertiary" onClick={onClose} className={styles.closeButton}>
                        {SiteContent.close}
                    </Button>
                </div>
                <div className={styles.content}>{children}</div>
            </div>
        </div>,
        document.body,
    );
};

export default Modal;
