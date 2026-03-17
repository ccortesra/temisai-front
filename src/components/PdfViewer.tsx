"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import { apiClient } from "@/lib/api/client";
import { DocumentChunk } from "@/lib/types/api";
import { Loader2, AlertCircle, ZoomIn, ZoomOut, Search } from "lucide-react";

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

// bbox values are normalized 0–1, origin top-left — convert directly to percentages.
function chunkHighlightStyle(chunk: DocumentChunk): React.CSSProperties | null {
    const w = (chunk.bbox_right - chunk.bbox_left) * 100;
    const h = (chunk.bbox_bottom - chunk.bbox_top) * 100;
    if (w <= 0 || h <= 0) return null;
    return {
        position: "absolute",
        left: `${chunk.bbox_left * 100}%`,
        top: `${chunk.bbox_top * 100}%`,
        width: `${w}%`,
        height: `${h}%`,
        backgroundColor: "rgba(250, 204, 21, 0.35)",
        border: "2px solid rgba(202, 138, 4, 0.8)",
        borderRadius: "2px",
        pointerEvents: "none",
        zIndex: 10,
    };
}

export default function PdfViewer({ docId, chunks = [] }: PdfViewerProps) {
    const [pdfUrl, setPdfUrl] = useState<string | null>(null);
    const [pdfError, setPdfError] = useState<string | null>(null);
    const [numPages, setNumPages] = useState<number>(0);
    const [zoomFactor, setZoomFactor] = useState<number>(1.0);
    const [containerWidth, setContainerWidth] = useState<number>(0);

    const containerRef = useRef<HTMLDivElement>(null);
    // Maps 0-indexed API page number → the wrapper div element
    const pageRefs = useRef<Map<number, HTMLDivElement>>(new Map());
    const objectUrlRef = useRef<string | null>(null);

    // Keep container width in sync so pages always fill the panel.
    useEffect(() => {
        const el = containerRef.current;
        if (!el) return;
        const ro = new ResizeObserver((entries) => {
            setContainerWidth(entries[0]?.contentRect.width ?? 0);
        });
        ro.observe(el);
        setContainerWidth(el.clientWidth);
        return () => ro.disconnect();
    }, []);

    // Fetch the PDF via authenticated request, build a blob URL.
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
                if (!cancelled) setPdfError("No se pudo cargar el PDF.");
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

    // Scroll to the first page that has a highlight whenever chunks change.
    useEffect(() => {
        if (chunks.length === 0) return;
        const firstApiPage = Math.min(...chunks.map((c) => c.page));
        // Small delay so the page has time to render before we scroll.
        const t = setTimeout(() => {
            pageRefs.current.get(firstApiPage)?.scrollIntoView({
                behavior: "smooth",
                block: "start",
            });
        }, 100);
        return () => clearTimeout(t);
    }, [chunks]);

    const onDocumentLoadSuccess = useCallback(({ numPages }: { numPages: number }) => {
        setNumPages(numPages);
    }, []);

    // Fill the panel width minus padding, then apply zoom multiplier.
    const pageWidth = containerWidth > 0 ? (containerWidth - 32) * zoomFactor : undefined;

    return (
        <div className="flex flex-col h-full bg-slate-100 border-r border-slate-200">
            {/* Toolbar */}
            <div className="flex items-center gap-4 px-4 py-2 bg-slate-800 text-slate-200 shrink-0">
                {/* Zoom controls */}
                <div className="flex items-center gap-1.5">
                    <button
                        onClick={() => setZoomFactor((z) => Math.max(0.5, +(z - 0.25).toFixed(2)))}
                        className="p-1 rounded hover:bg-slate-700 transition-colors disabled:opacity-30"
                        disabled={zoomFactor <= 0.5}
                        aria-label="Alejar"
                    >
                        <ZoomOut className="h-4 w-4" />
                    </button>
                    <span className="text-xs w-10 text-center tabular-nums">
                        {Math.round(zoomFactor * 100)}%
                    </span>
                    <button
                        onClick={() => setZoomFactor((z) => Math.min(3, +(z + 0.25).toFixed(2)))}
                        className="p-1 rounded hover:bg-slate-700 transition-colors disabled:opacity-30"
                        disabled={zoomFactor >= 3}
                        aria-label="Acercar"
                    >
                        <ZoomIn className="h-4 w-4" />
                    </button>
                </div>

                {/* Page count */}
                {numPages > 0 && (
                    <span className="text-xs text-slate-400 tabular-nums">
                        {numPages} paginas
                    </span>
                )}

                {/* Search hint */}
                <span className="flex items-center gap-1 text-xs text-slate-500 ml-auto">
                    <Search className="h-3 w-3" />
                    Ctrl+F para buscar
                </span>

                {/* Highlight count */}
                {chunks.length > 0 && (
                    <span className="text-xs text-yellow-300 font-medium">
                        {chunks.length} fragmento{chunks.length > 1 ? "s" : ""} resaltado{chunks.length > 1 ? "s" : ""}
                    </span>
                )}
            </div>

            {/* Scrollable PDF area — all pages stacked */}
            <div ref={containerRef} className="flex-1 overflow-y-auto overflow-x-auto bg-slate-200">
                {pdfError ? (
                    <div className="flex flex-col items-center justify-center h-full text-slate-500 gap-2 p-8">
                        <AlertCircle className="h-8 w-8 text-red-400" />
                        <p className="text-sm">{pdfError}</p>
                    </div>
                ) : !pdfUrl ? (
                    <div className="flex flex-col items-center justify-center h-full text-slate-400 gap-2 p-8">
                        <Loader2 className="h-8 w-8 animate-spin" />
                        <p className="text-sm">Cargando documento…</p>
                    </div>
                ) : (
                    <Document
                        file={pdfUrl}
                        onLoadSuccess={onDocumentLoadSuccess}
                        loading={
                            <div className="flex items-center justify-center gap-2 text-slate-400 p-8">
                                <Loader2 className="h-6 w-6 animate-spin" />
                                <span className="text-sm">Renderizando…</span>
                            </div>
                        }
                    >
                        {/* Render every page so the user can scroll freely and Ctrl+F works */}
                        {Array.from({ length: numPages }, (_, pageIndex) => {
                            const pageChunks = chunks.filter((c) => c.page === pageIndex);
                            return (
                                <div
                                    key={pageIndex}
                                    ref={(el) => {
                                        if (el) pageRefs.current.set(pageIndex, el);
                                        else pageRefs.current.delete(pageIndex);
                                    }}
                                    className="flex justify-center py-2 first:pt-4 last:pb-4"
                                >
                                    <Page
                                        pageNumber={pageIndex + 1}
                                        width={pageWidth}
                                        renderTextLayer={true}
                                        renderAnnotationLayer={false}
                                        className="shadow-md"
                                    >
                                        {pageChunks.map((chunk) => {
                                            const style = chunkHighlightStyle(chunk);
                                            return style ? (
                                                <div key={chunk.id} style={style} />
                                            ) : null;
                                        })}
                                    </Page>
                                </div>
                            );
                        })}
                    </Document>
                )}
            </div>
        </div>
    );
}
