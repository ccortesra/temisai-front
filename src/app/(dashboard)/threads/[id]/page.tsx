"use client";

import { useState, useRef, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api/client";
import {
    MessageResponse,
    ThreadResponse,
    ThreadChatResponse,
    AgentDocumentReport,
    DocumentChunk,
    CodeChunk,
} from "@/lib/types/api";
import {
    Send,
    Loader2,
    Bot,
    User,
    Trash2,
    Edit2,
    Check,
    X,
    ChevronLeft,
    ChevronRight,
    FileText,
    BookOpen,
    Scale,
    ScanText,
    BookMarked,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import dynamic from "next/dynamic";

const PdfViewer = dynamic(() => import("@/components/PdfViewer"), { ssr: false });

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Strip HTML anchor tags injected by the backend into chunk content. */
function cleanContent(raw: string): string {
    return raw.replace(/<[^>]*>/g, "").replace(/\n{3,}/g, "\n\n").trim();
}

function formatCodeName(codeName: string): string {
    return codeName
        .replace(/_/g, " ")
        .replace(/\b\w/g, (char) => char.toUpperCase())
        .trim();
}

/** Render a string that may contain **bold** markdown. */
function MarkdownText({ text }: { text: string }) {
    const lines = text.split("\n");
    return (
        <>
            {lines.map((line, li) => {
                const parts = line.split(/\*\*(.*?)\*\*/g);
                return (
                    <span key={li}>
                        {parts.map((part, i) =>
                            i % 2 === 1 ? (
                                <strong key={i} className="font-semibold text-slate-900">
                                    {part}
                                </strong>
                            ) : (
                                part
                            )
                        )}
                        {li < lines.length - 1 && <br />}
                    </span>
                );
            })}
        </>
    );
}

function LawChunksCard({ chunks }: { chunks: CodeChunk[] }) {
    if (chunks.length === 0) return null;

    return (
        <div className="mt-3 rounded-lg border border-indigo-200 bg-indigo-50 text-xs overflow-hidden">
            <div className="px-3 py-2 bg-indigo-100/70 border-b border-indigo-200">
                <span className="font-semibold text-indigo-900">⚖️ Fuentes del codigo legal</span>
                <p className="mt-0.5 text-indigo-700">
                    Expande un articulo para ver el fragmento legal completo.
                </p>
            </div>

            <div className="p-2 space-y-2">
                {chunks.map((chunk) => (
                    <details
                        key={chunk.id}
                        className="rounded-md border border-indigo-200 bg-white open:bg-indigo-50/40"
                    >
                        <summary className="cursor-pointer list-none px-3 py-2.5">
                            <div className="flex items-start justify-between gap-2">
                                <div className="min-w-0">
                                    <p className="font-semibold text-indigo-900">
                                        🧾 {chunk.articulo}
                                    </p>
                                    <p className="mt-0.5 text-indigo-700 truncate">
                                        🗂️ {chunk.capitulo}
                                    </p>
                                </div>
                                <span className="shrink-0 text-indigo-500 text-[11px]">
                                    Expandir
                                </span>
                            </div>
                            <p className="mt-1 text-indigo-700 line-clamp-2">
                                📘 {formatCodeName(chunk.code_name)}
                            </p>
                        </summary>

                        <div className="px-3 pb-3 pt-1 border-t border-indigo-200">
                            <p className="text-indigo-700">
                                🧭 <span className="font-medium">Ruta:</span> {chunk.breadcrumb}
                            </p>
                            <div className="mt-2 rounded border border-indigo-200 bg-white p-2.5">
                                <p className="whitespace-pre-wrap text-slate-700 leading-relaxed">
                                    {cleanContent(chunk.content)}
                                </p>
                            </div>
                        </div>
                    </details>
                ))}
            </div>
        </div>
    );
}

// ─── Chunk navigator card ─────────────────────────────────────────────────────

function ChunkNavigatorCard({
    chunks,
    onChunkSelect,
}: {
    chunks: DocumentChunk[];
    onChunkSelect: (chunk: DocumentChunk) => void;
}) {
    const [index, setIndex] = useState(0);
    if (chunks.length === 0) return null;

    const current = chunks[index];

    const goTo = (next: number) => {
        setIndex(next);
        onChunkSelect(chunks[next]);
    };

    return (
        <div className="mt-3 rounded-lg border border-amber-200 bg-amber-50 text-xs overflow-hidden">
            {/* Header row */}
            <div className="flex items-center justify-between px-3 py-2 bg-amber-100/70 border-b border-amber-200">
                <span className="flex items-center gap-1.5 font-semibold text-amber-800">
                    <FileText className="h-3.5 w-3.5" />
                    Fuentes
                </span>
                <div className="flex items-center gap-0.5 text-amber-700">
                    <button
                        onClick={() => goTo(index - 1)}
                        disabled={index === 0}
                        className="p-1 rounded hover:bg-amber-200 disabled:opacity-30 transition-colors"
                        aria-label="Fragmento anterior"
                    >
                        <ChevronLeft className="h-3.5 w-3.5" />
                    </button>
                    <span className="tabular-nums font-medium w-10 text-center">
                        {index + 1} / {chunks.length}
                    </span>
                    <button
                        onClick={() => goTo(index + 1)}
                        disabled={index === chunks.length - 1}
                        className="p-1 rounded hover:bg-amber-200 disabled:opacity-30 transition-colors"
                        aria-label="Siguiente fragmento"
                    >
                        <ChevronRight className="h-3.5 w-3.5" />
                    </button>
                </div>
            </div>

            {/* Chunk text preview */}
            <div className="px-3 py-2.5">
                <p className="text-slate-700 leading-relaxed line-clamp-4">
                    {cleanContent(current.content)}
                </p>
            </div>

            {/* Page indicator */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 border-t border-amber-200/60 text-amber-700">
                <BookOpen className="h-3 w-3" />
                <span>Pagina {current.page + 1}</span>
            </div>
        </div>
    );
}

// ─── Assistant message ────────────────────────────────────────────────────────

function AssistantMessage({
    content,
    agentReport,
    onChunkSelect,
    isDocMode,
}: {
    content: string;
    agentReport?: AgentDocumentReport;
    onChunkSelect: (chunk: DocumentChunk) => void;
    isDocMode: boolean;
}) {
    const answerText = agentReport?.answer ?? content;
    const chunks = agentReport?.most_relevant_chunks ?? [];
    const lawChunks = agentReport?.law_chunks ?? [];

    return (
        <div>
            <p className="text-sm text-slate-800 leading-relaxed">
                <MarkdownText text={answerText} />
            </p>
            {isDocMode && chunks.length > 0 && (
                <ChunkNavigatorCard chunks={chunks} onChunkSelect={onChunkSelect} />
            )}
            {lawChunks.length > 0 && <LawChunksCard chunks={lawChunks} />}
        </div>
    );
}

// ─── Chat panel (shared between both modes) ──────────────────────────────────

function ChatPanel({
    thread,
    threadId,
    isDocMode,
    messagesLoading,
    localMessages,
    agentResponses,
    chatMutation,
    inputQuery,
    setInputQuery,
    handleSubmit,
    handleTitleSubmit,
    isEditingTitle,
    setIsEditingTitle,
    editTitleValue,
    setEditTitleValue,
    deleteThread,
    setActiveChunks,
    messagesEndRef,
}: {
    thread?: ThreadResponse;
    threadId: string;
    isDocMode: boolean;
    messagesLoading: boolean;
    localMessages: MessageResponse[];
    agentResponses: Record<string, AgentDocumentReport>;
    chatMutation: ReturnType<typeof useMutation<ThreadChatResponse, Error, string>>;
    inputQuery: string;
    setInputQuery: (v: string) => void;
    handleSubmit: (e: React.FormEvent) => void;
    handleTitleSubmit: () => void;
    isEditingTitle: boolean;
    setIsEditingTitle: (v: boolean) => void;
    editTitleValue: string;
    setEditTitleValue: (v: string) => void;
    deleteThread: ReturnType<typeof useMutation<void, Error, void>>;
    setActiveChunks: (chunks: DocumentChunk[]) => void;
    messagesEndRef: React.RefObject<HTMLDivElement | null>;
}) {
    const ModeIcon = isDocMode ? ScanText : Scale;
    const modeColor = isDocMode ? "text-amber-500" : "text-emerald-500";
    const modeLabel = isDocMode ? "Experto OCR" : "ChatLegal";
    const emptyTitle = isDocMode
        ? "Inicia un analisis de documento"
        : "Inicia una conversacion legal";
    const emptySubtitle = isDocMode
        ? "Haz una pregunta sobre este documento."
        : "Haz cualquier pregunta sobre derecho colombiano.";
    const pendingLabel = isDocMode
        ? "Analizando documento…"
        : "Razonando…";

    const supportedCodeDocuments = [
        "Constitucion Politica",
        "Codigo Sustantivo del Trabajo",
        "Codigo Civil",
        "Ley 820 del 2003",
    ];

    return (
        <div className={cn(
            "flex-1 flex flex-col bg-white min-w-0 min-h-0",
            isDocMode
                ? "border-t md:border-t-0 md:border-l border-slate-200"
                : "border-l border-slate-200"
        )}>
            {/* Header */}
            <div className="h-14 border-b border-slate-200 flex items-center justify-between px-4 bg-slate-50 shrink-0">
                <div className="flex items-center gap-2 min-w-0">
                    <ModeIcon className={cn("h-4 w-4 shrink-0", modeColor)} />
                    {isEditingTitle ? (
                        <div className="flex items-center gap-1.5">
                            <input
                                type="text"
                                value={editTitleValue}
                                onChange={(e) => setEditTitleValue(e.target.value)}
                                onKeyDown={(e) =>
                                    e.key === "Enter" && handleTitleSubmit()
                                }
                                className="px-2 py-1 text-sm border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-slate-900 w-36"
                                autoFocus
                            />
                            <button
                                onClick={handleTitleSubmit}
                                className="text-green-600 hover:text-green-700"
                            >
                                <Check className="h-4 w-4" />
                            </button>
                            <button
                                onClick={() => setIsEditingTitle(false)}
                                className="text-slate-400 hover:text-slate-600"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        </div>
                    ) : (
                        <>
                            <h2 className="text-sm font-semibold text-slate-800 truncate">
                                {thread?.title || modeLabel}
                            </h2>
                            <button
                                onClick={() => setIsEditingTitle(true)}
                                className="shrink-0 text-slate-400 hover:text-slate-700 transition-colors"
                            >
                                <Edit2 className="h-3.5 w-3.5" />
                            </button>
                        </>
                    )}
                </div>

                <button
                    onClick={() => {
                        if (confirm("Eliminar esta conversacion?")) deleteThread.mutate();
                    }}
                    className="shrink-0 text-slate-400 hover:text-red-600 transition-colors"
                    title="Eliminar conversacion"
                >
                    <Trash2 className="h-4 w-4" />
                </button>
            </div>

            {!isDocMode && (
                <div className="px-4 py-3 border-b border-slate-200 bg-white shrink-0">
                    <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
                        Fuentes legales disponibles
                    </p>
                    {supportedCodeDocuments.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                            {supportedCodeDocuments.map((docName) => (
                                <div
                                    key={docName}
                                    className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md border border-emerald-200 bg-emerald-50 text-emerald-700"
                                >
                                    <BookMarked className="h-3 w-3 shrink-0 text-emerald-500" />
                                    <span className="text-xs font-medium">{docName}</span>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-xs text-slate-500">
                            Aun no hay fuentes legales disponibles.
                        </p>
                    )}
                </div>
            )}

            {/* Messages */}
            <div className="flex-1 min-h-0 overflow-y-auto p-4 space-y-5">
                {messagesLoading ? (
                    <div className="flex justify-center items-center h-full">
                        <Loader2 className="h-6 w-6 animate-spin text-slate-300" />
                    </div>
                ) : localMessages.length === 0 ? (
                    <div className="flex flex-col justify-center items-center h-full text-slate-400 px-4">
                        <ModeIcon className={cn("h-10 w-10 mb-3 opacity-30", modeColor)} />
                        <p className="text-sm font-medium text-slate-600 text-center">
                            {emptyTitle}
                        </p>
                        <p className="text-xs mt-1 text-center text-slate-400">
                            {emptySubtitle}
                        </p>

                    </div>
                ) : (
                    localMessages.map((msg) =>
                        msg.role === "user" ? (
                            <div key={msg.id} className="flex justify-end gap-2">
                                <div className="bg-slate-900 text-white px-4 py-2.5 rounded-2xl rounded-tr-sm text-sm max-w-[85%]">
                                    {msg.content}
                                </div>
                                <div className="flex items-center justify-center shrink-0 w-7 h-7 rounded bg-slate-900 text-white mt-0.5">
                                    <User className="h-4 w-4" />
                                </div>
                            </div>
                        ) : (
                            <div key={msg.id} className="flex gap-2">
                                <div className={cn(
                                    "flex items-start justify-center shrink-0 w-7 h-7 rounded border mt-0.5",
                                    isDocMode
                                        ? "border-amber-200 bg-amber-50 text-amber-700"
                                        : "border-emerald-200 bg-emerald-50 text-emerald-700"
                                )}>
                                    <ModeIcon className="h-4 w-4 mt-1.5" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <AssistantMessage
                                        content={msg.content}
                                        agentReport={agentResponses[msg.id]}
                                        onChunkSelect={(chunk) =>
                                            setActiveChunks([chunk])
                                        }
                                        isDocMode={isDocMode}
                                    />
                                </div>
                            </div>
                        )
                    )
                )}

                {chatMutation.isPending && (
                    <>
                        <div className="flex justify-end gap-2">
                            <div className="bg-slate-900 text-white px-4 py-2.5 rounded-2xl rounded-tr-sm text-sm max-w-[85%] opacity-70">
                                {chatMutation.variables}
                            </div>
                            <div className="flex items-center justify-center shrink-0 w-7 h-7 rounded bg-slate-900 text-white mt-0.5">
                                <User className="h-4 w-4" />
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <div className="flex items-center justify-center shrink-0 w-7 h-7 rounded border border-slate-200 bg-white text-slate-700 mt-0.5">
                                <Loader2 className="h-4 w-4 animate-spin" />
                            </div>
                            <div className="pt-1.5">
                                <span className="text-xs text-slate-500 animate-pulse">
                                    {pendingLabel}
                                </span>
                            </div>
                        </div>
                    </>
                )}

                <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-3 border-t border-slate-200 shrink-0">
                <form
                    onSubmit={handleSubmit}
                    className="relative flex items-end shadow-sm"
                >
                    <textarea
                        value={inputQuery}
                        onChange={(e) => setInputQuery(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === "Enter" && !e.shiftKey) {
                                e.preventDefault();
                                handleSubmit(e);
                            }
                        }}
                        placeholder={
                            isDocMode
                                ? "Pregunta sobre este documento… (Shift+Enter para nueva linea)"
                                : "Haz una pregunta legal… (Shift+Enter para nueva linea)"
                        }
                        className="w-full resize-none min-h-[48px] max-h-[160px] border border-slate-300 rounded-lg py-3 pl-3 pr-12 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
                        rows={1}
                        disabled={chatMutation.isPending}
                    />
                    <Button
                        type="submit"
                        size="icon"
                        disabled={!inputQuery.trim() || chatMutation.isPending}
                        className="absolute right-1.5 bottom-1.5 h-9 w-9 bg-slate-900 rounded-md shadow-sm transition-transform active:scale-95"
                    >
                        <Send className="h-4 w-4" />
                    </Button>
                </form>
                <p className="text-center text-xs text-slate-400 mt-1.5">
                    TemisAI puede equivocarse. Verifica la informacion critica.
                </p>
            </div>
        </div>
    );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function ThreadChatPage() {
    const params = useParams();
    const threadId = params.id as string;
    const router = useRouter();
    const queryClient = useQueryClient();
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const [inputQuery, setInputQuery] = useState("");
    const [isEditingTitle, setIsEditingTitle] = useState(false);
    const [editTitleValue, setEditTitleValue] = useState("");
    const [activeChunks, setActiveChunks] = useState<DocumentChunk[]>([]);
    const [agentResponses, setAgentResponses] = useState<
        Record<string, AgentDocumentReport>
    >({});
    const [localMessages, setLocalMessages] = useState<MessageResponse[]>([]);

    // ── Queries ──────────────────────────────────────────────────────────────

    const { data: thread } = useQuery({
        queryKey: ["thread", threadId],
        queryFn: async () => {
            const res = await apiClient.get<ThreadResponse>(`/threads/${threadId}`);
            setEditTitleValue(res.data.title || "");
            return res.data;
        },
    });

    const { isLoading: messagesLoading } = useQuery({
        queryKey: ["thread", threadId, "messages"],
        queryFn: async () => {
            const res = await apiClient.get<MessageResponse[]>(
                `/threads/${threadId}/messages`
            );
            setLocalMessages(res.data);
            return res.data;
        },
    });

    const isDocMode = !!thread?.doc_id;

    // ── Mutations ────────────────────────────────────────────────────────────

    const updateTitle = useMutation({
        mutationFn: async (newTitle: string) => {
            await apiClient.patch(`/threads/${threadId}`, { title: newTitle });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["thread", threadId] });
            queryClient.invalidateQueries({ queryKey: ["threads"] });
            setIsEditingTitle(false);
        },
    });

    const deleteThread = useMutation({
        mutationFn: async () => {
            await apiClient.delete(`/threads/${threadId}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["threads"] });
            router.push("/documents");
        },
    });

    const chatMutation = useMutation({
        mutationFn: async (query: string) => {
            const res = await apiClient.post<ThreadChatResponse>(
                `/threads/${threadId}/chat`,
                { query }
            );
            return res.data;
        },
        onMutate: () => {
            setInputQuery("");
        },
        onSuccess: (data) => {
            setLocalMessages((prev) => [
                ...prev,
                data.user_message,
                data.assistant_message,
            ]);
            setAgentResponses((prev) => ({
                ...prev,
                [data.assistant_message.id]: data.agent_response,
            }));
            const first = data.agent_response.most_relevant_chunks[0];
            if (first) setActiveChunks([first]);
        },
    });

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [localMessages, chatMutation.isPending]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const query = inputQuery.trim();
        if (!query || chatMutation.isPending) return;
        chatMutation.mutate(query);
    };

    const handleTitleSubmit = () => {
        if (editTitleValue.trim() && editTitleValue !== thread?.title) {
            updateTitle.mutate(editTitleValue);
        } else {
            setIsEditingTitle(false);
        }
    };

    // ── Shared chat props ────────────────────────────────────────────────────

    const chatProps = {
        thread,
        threadId,
        isDocMode,
        messagesLoading,
        localMessages,
        agentResponses,
        chatMutation: chatMutation as ReturnType<typeof useMutation<ThreadChatResponse, Error, string>>,
        inputQuery,
        setInputQuery,
        handleSubmit,
        handleTitleSubmit,
        isEditingTitle,
        setIsEditingTitle,
        editTitleValue,
        setEditTitleValue,
        deleteThread: deleteThread as ReturnType<typeof useMutation<void, Error, void>>,
        setActiveChunks,
        messagesEndRef,
    };

    // ── Render ───────────────────────────────────────────────────────────────

    if (isDocMode) {
        return (
            <div className="flex h-full overflow-hidden flex-col md:flex-row">
                {/* PDF Viewer */}
                <div className="w-full h-[48%] md:h-auto md:w-[70%] flex flex-col overflow-hidden">
                    {thread?.doc_id ? (
                        <PdfViewer docId={thread.doc_id} chunks={activeChunks} />
                    ) : (
                        <div className="flex-1 flex items-center justify-center bg-slate-100 text-slate-400">
                            <Loader2 className="h-6 w-6 animate-spin" />
                        </div>
                    )}
                </div>

                {/* Chat panel */}
                <div className="w-full h-[52%] md:h-auto md:w-[30%] flex flex-col min-w-0 min-h-0">
                    <ChatPanel {...chatProps} />
                </div>
            </div>
        );
    }

    // ChatLegal mode — full-width centered chat
    return (
        <div className="h-full overflow-hidden flex justify-center">
            <div className="w-full max-w-3xl h-full flex flex-col min-w-0 min-h-0">
                <ChatPanel {...chatProps} />
            </div>
        </div>
    );
}
