"use client";

import { useEffect, useState } from "react";
import { SiteContent } from "@/src/lib/content";
import styles from "./welcomeMessage.module.css";

type WelcomeMessageProps = {
    isActive: boolean;
};

export const WelcomeMessage = ({ isActive }: WelcomeMessageProps) => {
    const fullText = SiteContent.welcomeMessage;
    const [visibleText, setVisibleText] = useState("");

    useEffect(() => {
        if (!isActive) {
            return;
        }

        setVisibleText("");
        let index = 0;

        const intervalId = window.setInterval(() => {
            index += 1;
            setVisibleText(fullText.slice(0, index));

            if (index >= fullText.length) {
                window.clearInterval(intervalId);
            }
        }, 18);

        return () => window.clearInterval(intervalId);
    }, [fullText, isActive]);

    if (!isActive) {
        return null;
    }

    const isTyping = visibleText.length < fullText.length;

    return (
        <div className={styles.messageRow}>
            <p className={styles.messageText}>
                {visibleText}
                {isTyping ? <span className={styles.cursor} aria-hidden="true">▍</span> : null}
            </p>
        </div>
    );
};
