import { useEffect, useMemo, useState } from "react";

type UsePdfViewerStateParams = {
    documentId: string;
    initialPage?: number | null;
};

export const usePdfViewerState = ({
    documentId,
    initialPage = 1,
}: UsePdfViewerStateParams) => {
    const [isPdfLoaded, setIsPdfLoaded] = useState(false);
    const [numPages, setNumPages] = useState(0);
    const [currentPage, setCurrentPage] = useState(Math.max(1, initialPage ?? 1));
    const [zoom, setZoom] = useState(1);

    const clampedPage = useMemo(() => {
        if (numPages <= 0) return Math.max(1, currentPage);
        return Math.min(Math.max(1, currentPage), numPages);
    }, [currentPage, numPages]);

    const goToPage = (nextPage: number) => {
        if (!Number.isFinite(nextPage)) return;

        if (numPages <= 0) {
            setCurrentPage(Math.max(1, Math.round(nextPage)));
            return;
        }

        setCurrentPage(Math.min(Math.max(1, Math.round(nextPage)), numPages));
    };

    const zoomIn = () => setZoom((value) => Math.min(2, Number((value + 0.1).toFixed(2))));
    const zoomOut = () => setZoom((value) => Math.max(0.6, Number((value - 0.1).toFixed(2))));

    const handleLoadSuccess = (loadedPages: number) => {
        setNumPages(loadedPages);
        setCurrentPage((previous) => Math.min(Math.max(1, previous), loadedPages));
        setIsPdfLoaded(true);
    };

    const handleLoadError = () => {
        setNumPages(0);
        setIsPdfLoaded(false);
    };

    useEffect(() => {
        setIsPdfLoaded(false);
        setNumPages(0);
        setCurrentPage(Math.max(1, initialPage ?? 1));
        setZoom(1);
    }, [documentId, initialPage]);

    return {
        isPdfLoaded,
        numPages,
        clampedPage,
        zoom,
        goToPage,
        zoomIn,
        zoomOut,
        handleLoadSuccess,
        handleLoadError,
    };
};
