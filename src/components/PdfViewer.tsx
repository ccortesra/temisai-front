"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import { apiClient } from "@/lib/api/client";
import { DocumentChunk } from "@/lib/types/api";
import { ChevronLeft, ChevronRight, Loader2, AlertCircle, ZoomIn, ZoomOut } from "lucide-react";

import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
    "pdfjs-dist/build/pdf.worker.min.mjs",
    import.meta.url
).toString();

interface PdfViewerProps {
    docId: string;
    chunks?: DocumentChunk[];
}

interface PageDimensions {
    width: number;
    height: number;
}

export default function PdfViewer({ docId, chunks = [] }: PdfViewerProps) {
    const [pdfUrl, setPdfUrl] = useState<string | null>(null);
    const [pdfError, setPdfError] = useState<string | null>(null);
    const [numPages, setNumPages] = useState<number>(0);
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [scale, setScale] = useState<number>(1.0);
    const [pageDimensions, setPageDimensions] = useState<PageDimensions | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const objectUrlRef = useRef<string | null>(null);

    useEffect(() => {
        let cancelled = false;

        const fetchPdf = async () => {
            try {
                setPdfError(null);
                setPdfUrl(null);
                const res = await apiClient.get(`/documents/${docId}/pdf`, {
                    responseType: "blob",
                });
                if (cancelled) return;
                const blob = new Blob([res.data], { type: "application/pdf" });
                const url = URL.createObjectURL(blob);
                objectUrlRef.current = url;
                setPdfUrl(url);
            } catch {
                if (!cancelled) setPdfError("Failed to load PDF.");
            }
        };

        fetchPdf();

        return () => {
            cancelled = true;
            if (objectUrlRef.current) {
                URL.revokeObjectURL(objectUrlRef.current);
                objectUrlRef.current = null;
            }
        };
    }, [docId]);

    // Auto-navigate to the first page that has a highlighted chunk whenever chunks change
    useEffect(() => {
        if (chunks.length > 0) {
            const firstPage = Math.min(...chunks.map((c) => c.page));
            setCurrentPage(firstPage);
        }
    }, [chunks]);

    const onDocumentLoadSuccess = useCallback(({ numPages }: { numPages: number }) => {
        setNumPages(numPages);
    }, []);

    const onPageLoadSuccess = useCallback((page: any) => {
        const viewport = page.getViewport({ scale: 1 });
        setPageDimensions({ width: viewport.width, height: viewport.height });
    }, []);

    const chunksOnPage = chunks.filter((c) => c.page === currentPage);

    const renderHighlights = () => {
        if (!pageDimensions || chunksOnPage.length === 0) return null;
        const { width: pdfW, height: pdfH } = pageDimensions;

        return chunksOnPage.map((chunk) => {
            const left = (chunk.bbox_left / pdfW) * 100;
            const top = (chunk.bbox_top / pdfH) * 100;
            const width = ((chunk.bbox_right - chunk.bbox_left) / pdfW) * 100;
            const height = ((chunk.bbox_bottom - chunk.bbox_top) / pdfH) * 100;

            return (
                <div
                    key={chunk.id}
                    className="absolute pointer-events-none rounded-sm"
                    style={{
                        left: `${left}%`,
                        top: `${top}%`,
                        width: `${width}%`,
                        height: `${height}%`,
                        backgroundColor: "rgba(250, 204, 21, 0.35)",
                        border: "1.5px solid rgba(202, 138, 4, 0.6)",
                    }}
                />
            );
        });
    };

    return (
        <div className="flex flex-col h-full bg-slate-100 border-r border-slate-200">
            {/* Toolbar */}
            <div className="flex items-center justify-between px-4 py-2 bg-slate-800 text-slate-200 shrink-0">
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                        disabled={currentPage <= 1}
                        className="p-1 rounded hover:bg-slate-700 disabled:opacity-30 transition-colors"
                        aria-label="Previous page"
                    >
                        <ChevronLeft className="h-4 w-4" />
                    </button>
                    <span className="text-sm tabular-nums">
                        {currentPage} / {numPages || "—"}
                    </span>
                    <button
                        onClick={() => setCurrentPage((p) => Math.min(numPages, p + 1))}
                        disabled={currentPage >= numPages}
                        className="p-1 rounded hover:bg-slate-700 disabled:opacity-30 transition-colors"
                        aria-label="Next page"
                    >
                        <ChevronRight className="h-4 w-4" />
                    </button>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setScale((s) => Math.max(0.5, +(s - 0.25).toFixed(2)))}
                        className="p-1 rounded hover:bg-slate-700 transition-colors"
                        aria-label="Zoom out"
                    >
                        <ZoomOut className="h-4 w-4" />
                    </button>
                    <span className="text-xs w-12 text-center">{Math.round(scale * 100)}%</span>
                    <button
                        onClick={() => setScale((s) => Math.min(3, +(s + 0.25).toFixed(2)))}
                        className="p-1 rounded hover:bg-slate-700 transition-colors"
                        aria-label="Zoom in"
                    >
                        <ZoomIn className="h-4 w-4" />
                    </button>
                </div>

                {chunksOnPage.length > 0 && (
                    <span className="text-xs text-yellow-300 font-medium">
                        {chunksOnPage.length} highlight{chunksOnPage.length > 1 ? "s" : ""} on this page
                    </span>
                )}
            </div>

            {/* PDF area */}
            <div ref={containerRef} className="flex-1 overflow-auto flex justify-center p-4">
                {pdfError ? (
                    <div className="flex flex-col items-center justify-center text-slate-500 gap-2 mt-20">
                        <AlertCircle className="h-8 w-8 text-red-400" />
                        <p className="text-sm">{pdfError}</p>
                    </div>
                ) : !pdfUrl ? (
                    <div className="flex flex-col items-center justify-center text-slate-400 gap-2 mt-20">
                        <Loader2 className="h-8 w-8 animate-spin" />
                        <p className="text-sm">Loading document…</p>
                    </div>
                ) : (
                    <Document
                        file={pdfUrl}
                        onLoadSuccess={onDocumentLoadSuccess}
                        loading={
                            <div className="flex items-center gap-2 text-slate-400 mt-20">
                                <Loader2 className="h-6 w-6 animate-spin" />
                                <span className="text-sm">Rendering…</span>
                            </div>
                        }
                    >
                        <div className="relative inline-block shadow-lg">
                            <Page
                                pageNumber={currentPage}
                                scale={scale}
                                onLoadSuccess={onPageLoadSuccess}
                                renderTextLayer={true}
                                renderAnnotationLayer={false}
                            />
                            {/* Highlight overlay — sits on top of the rendered page */}
                            <div className="absolute inset-0 pointer-events-none">
                                {renderHighlights()}
                            </div>
                        </div>
                    </Document>
                )}
            </div>
        </div>
    );
}
