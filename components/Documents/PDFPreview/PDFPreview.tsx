"use client";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";
import { Loader2 } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import styles from "./PDFPreview.module.css";
import { SiteContent } from "@/src/lib/content";
import { usePdfViewerState } from "./hooks/usePdfViewerState";
import { PDFPreviewToolbar } from "./components/PDFPreviewToolbar";

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
    const previewRef = useRef<HTMLDivElement | null>(null);
    const [containerWidth, setContainerWidth] = useState(840);
    const fileUrl = `/api/documents/${documentId}/file`;

    const {
        isPdfLoaded,
        numPages,
        clampedPage,
        zoom,
        goToPage,
        zoomIn,
        zoomOut,
        handleLoadSuccess,
        handleLoadError,
    } = usePdfViewerState({
        documentId,
        initialPage: pageNumber,
    });

    const pageWidth = useMemo(() => {
        const safeContainerWidth = Math.max(320, containerWidth - 32);
        return Math.max(320, Math.round(safeContainerWidth * zoom));
    }, [containerWidth, zoom]);

    useEffect(() => {
        const node = previewRef.current;

        if (!node) return;

        const observer = new ResizeObserver((entries) => {
            const nextWidth = entries[0]?.contentRect.width;
            if (!nextWidth) return;

            setContainerWidth(Math.round(nextWidth));
        });

        observer.observe(node);

        return () => {
            observer.disconnect();
        };
    }, []);

    return (
        <div className={styles.container}>
            <PDFPreviewToolbar
                isPdfLoaded={isPdfLoaded}
                currentPage={clampedPage}
                totalPages={numPages}
                zoom={zoom}
                onFirstPage={() => goToPage(1)}
                onPrevPage={() => goToPage(clampedPage - 1)}
                onNextPage={() => goToPage(clampedPage + 1)}
                onLastPage={() => goToPage(numPages)}
                onPageChange={goToPage}
                onZoomIn={zoomIn}
                onZoomOut={zoomOut}
            />

            <div className={styles.previewFrame} ref={previewRef}>
                <Document
                    file={fileUrl}
                    loading={(
                        <div className={styles.loadingState} aria-label={SiteContent.loadingPdf} aria-live="polite">
                            <Loader2 className={styles.loadingIcon} aria-hidden="true" />
                        </div>
                    )}
                    onLoadSuccess={({ numPages: loadedPages }) => handleLoadSuccess(loadedPages)}
                    onLoadError={handleLoadError}
                >
                    <Page
                        pageNumber={clampedPage}
                        width={pageWidth}
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