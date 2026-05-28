import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Minus, Plus } from "lucide-react";
import { SiteContent } from "@/src/lib/content";
import styles from "./PDFPreviewToolbar.module.css";

type PDFPreviewToolbarProps = {
    isPdfLoaded: boolean;
    currentPage: number;
    totalPages: number;
    zoom: number;
    onFirstPage: () => void;
    onPrevPage: () => void;
    onNextPage: () => void;
    onLastPage: () => void;
    onPageChange: (page: number) => void;
    onZoomIn: () => void;
    onZoomOut: () => void;
};

export const PDFPreviewToolbar = ({
    isPdfLoaded,
    currentPage,
    totalPages,
    zoom,
    onFirstPage,
    onPrevPage,
    onNextPage,
    onLastPage,
    onPageChange,
    onZoomIn,
    onZoomOut,
}: PDFPreviewToolbarProps) => {
    const safeTotalPages = Math.max(1, totalPages);

    return (
        <div className={styles.toolbar}>
            <div className={styles.navGroup}>
                <button
                    type="button"
                    className={styles.iconButton}
                    onClick={onFirstPage}
                    disabled={!isPdfLoaded || currentPage <= 1}
                    aria-label={SiteContent.firstPage}
                >
                    <ChevronsLeft size={16} aria-hidden="true" />
                </button>

                <button
                    type="button"
                    className={styles.iconButton}
                    onClick={onPrevPage}
                    disabled={!isPdfLoaded || currentPage <= 1}
                    aria-label={SiteContent.previousPage}
                >
                    <ChevronLeft size={16} aria-hidden="true" />
                </button>

                <label className={styles.pageLabel}>
                    <span>{SiteContent.page}</span>
                    <input
                        type="number"
                        min={1}
                        max={safeTotalPages}
                        value={currentPage}
                        disabled={!isPdfLoaded}
                        className={styles.pageInput}
                        onChange={(event) => onPageChange(Number(event.target.value))}
                    />
                    <span>{SiteContent.of} {safeTotalPages}</span>
                </label>

                <button
                    type="button"
                    className={styles.iconButton}
                    onClick={onNextPage}
                    disabled={!isPdfLoaded || (totalPages > 0 && currentPage >= totalPages)}
                    aria-label={SiteContent.nextPage}
                >
                    <ChevronRight size={16} aria-hidden="true" />
                </button>

                <button
                    type="button"
                    className={styles.iconButton}
                    onClick={onLastPage}
                    disabled={!isPdfLoaded || (totalPages > 0 && currentPage >= totalPages)}
                    aria-label={SiteContent.lastPage}
                >
                    <ChevronsRight size={16} aria-hidden="true" />
                </button>
            </div>

            <div className={styles.navGroup}>
                <button
                    type="button"
                    className={styles.iconButton}
                    onClick={onZoomOut}
                    disabled={!isPdfLoaded || zoom <= 0.6}
                    aria-label={SiteContent.zoomOut}
                >
                    <Minus size={16} aria-hidden="true" />
                </button>

                <span className={styles.zoomValue}>{Math.round(zoom * 100)}%</span>

                <button
                    type="button"
                    className={styles.iconButton}
                    onClick={onZoomIn}
                    disabled={!isPdfLoaded || zoom >= 2}
                    aria-label={SiteContent.zoomIn}
                >
                    <Plus size={16} aria-hidden="true" />
                </button>
            </div>
        </div>
    );
};
