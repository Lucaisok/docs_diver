import { Citation } from "@/src/types/message";
import { SiteContent } from "@/src/lib/content";
import { ChevronDown } from "lucide-react";
import { useState } from "react";
import styles from "./citations.module.css";
import Modal from "@/components/Modal/Modal";
import { PDFPreview } from "@/components/Documents/PDFPreview/PDFPreview";

type CitationsProps = {
    citations: Citation[];
};

type CitationPreviewSource = Citation & {
    pageNumber?: number | null;
};

export const Citations = ({ citations }: CitationsProps) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const [selectedSource, setSelectedSource] = useState<CitationPreviewSource | null>(null);

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
                        <button
                            type="button"
                            key={`${citation.documentId}-${citation.chunkIndex}`}
                            className={styles.citationCard}
                            onClick={() => setSelectedSource(citation)}
                        >
                            <p className={styles.citationSource}>
                                {citation.documentName}
                            </p>

                            <p className={styles.citationMeta}>
                                {SiteContent.chunk} {citation.chunkIndex} · {SiteContent.similarity} {citation.similarity.toFixed(3)}
                            </p>

                            <p className={styles.citationExcerpt}>{citation.excerpt}...</p>
                        </button>
                    ))}
                </div>
            ) : null}

            <Modal
                isOpen={selectedSource !== null}
                onClose={() => setSelectedSource(null)}
                title={selectedSource?.documentName}
                className={styles.pdfPreviewModal}
            >
                {selectedSource ? (
                    <PDFPreview
                        documentId={selectedSource.documentId}
                        pageNumber={selectedSource.pageNumber ?? 1}
                        excerpt={selectedSource.excerpt}
                    />
                ) : null}
            </Modal>
        </div>
    );
};
