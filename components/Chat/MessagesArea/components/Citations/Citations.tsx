import { Citation } from "@/src/types/message";
import { SiteContent } from "@/src/lib/content";
import { ChevronDown } from "lucide-react";
import { useState } from "react";
import styles from "./citations.module.css";

type CitationsProps = {
    citations: Citation[];
};

export const Citations = ({ citations }: CitationsProps) => {
    const [isExpanded, setIsExpanded] = useState(false);

    if (citations.length === 0) {
        return null;
    }

    return (
        <div className={styles.citationsSection}>
            <button
                type="button"
                className={styles.citationsToggle}
                onClick={() => setIsExpanded((current) => !current)}
                aria-expanded={isExpanded}
            >
                <ChevronDown
                    className={`${styles.citationsChevron} ${isExpanded ? styles.citationsChevronExpanded : ""}`}
                    aria-hidden="true"
                />
                <span className={styles.citationsTitle}>{SiteContent.sources}</span>
            </button>

            {isExpanded ? (
                <div className={styles.citationsList}>
                    {citations.map((citation) => (
                        <div
                            key={`${citation.documentId}-${citation.chunkIndex}`}
                            className={styles.citationCard}
                        >
                            <p className={styles.citationSource}>
                                [{SiteContent.source} {citation.sourceNumber}] {citation.documentName}
                            </p>

                            <p className={styles.citationMeta}>
                                {SiteContent.chunk} {citation.chunkIndex} · {SiteContent.similarity} {citation.similarity.toFixed(3)}
                            </p>

                            <p className={styles.citationExcerpt}>{citation.excerpt}...</p>
                        </div>
                    ))}
                </div>
            ) : null}
        </div>
    );
};
