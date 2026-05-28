"use client";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import styles from "./PDFPreview.module.css";
import { SiteContent } from "@/src/lib/content";

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
    "pdfjs-dist/build/pdf.worker.min.mjs",
    import.meta.url
).toString();

type PDFPreviewProps = {
    documentId: string;
    pageNumber?: number | null;
    excerpt?: string;
};

export const PDFPreview = ({
    documentId,
    pageNumber = 1,
    excerpt,
}: PDFPreviewProps) => {
    const [isPdfLoaded, setIsPdfLoaded] = useState(false);
    const fileUrl = `/api/documents/${documentId}/file`;

    useEffect(() => {
        setIsPdfLoaded(false);
    }, [documentId]);

    return (
        <div className={styles.container}>
            <div className={styles.previewFrame}>
                <Document
                    file={fileUrl}
                    loading={(
                        <div className={styles.loadingState} aria-label={SiteContent.loadingPdf} aria-live="polite">
                            <Loader2 className={styles.loadingIcon} aria-hidden="true" />
                        </div>
                    )}
                    onLoadSuccess={() => setIsPdfLoaded(true)}
                    onLoadError={() => setIsPdfLoaded(false)}
                >
                    <Page
                        pageNumber={pageNumber ?? 1}
                        width={840}
                        renderAnnotationLayer
                        renderTextLayer
                    />
                </Document>
            </div>

            {isPdfLoaded && excerpt ? (
                <div className={styles.excerptCard}>
                    <p className={styles.excerptTitle}>{SiteContent.selectedChunkExcerpt}</p>
                    <p className={styles.excerptText}>{excerpt}</p>
                </div>
            ) : null}
        </div>
    );
};