"use client";

import { useState, useRef, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api/client";
import {
    MessageResponse,
    ThreadResponse,
    ThreadChatResponse,
    DocumentChunk,
    ConstitutionChunk,
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
    ChevronDown,
    ChevronRight,
    FileText,
    Scale,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import dynamic from "next/dynamic";

const PdfViewer = dynamic(() => import("@/components/PdfViewer"), { ssr: false });

// ─── Expandable chunk list ────────────────────────────────────────────────────

function ChunkList({
    title,
    chunks,
    icon: Icon,
    defaultOpen = false,
}: {
    title: string;
    chunks: (DocumentChunk | ConstitutionChunk)[];
    icon: React.ElementType;
    defaultOpen?: boolean;
}) {
    const [isOpen, setIsOpen] = useState(defaultOpen);
    if (!chunks || chunks.length === 0) return null;

    return (
        <div className="mt-3 border border-slate-200 rounded-md bg-white overflow-hidden text-sm">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center justify-between p-3 bg-slate-50 hover:bg-slate-100 transition-colors text-slate-700 font-medium"
            >
                <span className="flex items-center gap-2">
                    <Icon className="h-4 w-4 text-slate-500" />
                    {title} ({chunks.length})
                </span>
                {isOpen ? (
                    <ChevronDown className="h-4 w-4" />
                ) : (
                    <ChevronRight className="h-4 w-4" />
                )}
            </button>

            {isOpen && (
                <div className="border-t border-slate-200 max-h-52 overflow-y-auto">
                    <ul className="divide-y divide-slate-100">
                        {chunks.map((chunk, idx) => (
                            <li key={chunk.id || idx} className="p-3">
                                {"page" in chunk ? (
                                    <div className="text-xs font-semibold text-slate-500 mb-1">
                                        Page {chunk.page}
                                    </div>
                                ) : (
                                    <div className="text-xs font-semibold text-slate-500 mb-1">
                                        {(chunk as ConstitutionChunk).breadcrumb}
                                    </div>
                                )}
                                <p className="text-slate-600 whitespace-pre-wrap text-xs">
                                    {chunk.content}
                                </p>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
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

    // Local list of messages built from the initial fetch + optimistic mutation appends
    const [localMessages, setLocalMessages] = useState<MessageResponse[]>([]);

    // ── Queries ──────────────────────────────────────────────────────────────

    const { data: thread } = useQuery({
        queryKey: ["thread", threadId],
        queryFn: async () => {
            const res = await apiClient.get<ThreadResponse>(`/threads/${threadId}`);
            setEditTitleValue(res.data.title || "Untitled Thread");
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
        onMutate: (query) => {
            setInputQuery("");
            return { query };
        },
        onSuccess: (data) => {
            // Append both messages directly — no refetch needed
            setLocalMessages((prev) => [
                ...prev,
                data.user_message,
                data.assistant_message,
            ]);
            // Update highlighted chunks from this response
            setActiveChunks(data.agent_response.most_relevant_chunks);
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

    // ── Render ───────────────────────────────────────────────────────────────

    return (
        <div className="flex h-full overflow-hidden">
            {/* ── PDF Viewer (70%) ── */}
            <div className="w-[70%] flex flex-col overflow-hidden">
                {thread?.doc_id ? (
                    <PdfViewer docId={thread.doc_id} chunks={activeChunks} />
                ) : (
                    <div className="flex-1 flex items-center justify-center bg-slate-100 text-slate-400">
                        <Loader2 className="h-6 w-6 animate-spin" />
                    </div>
                )}
            </div>

            {/* ── Chat panel (30%) ── */}
            <div className="w-[30%] flex flex-col border-l border-slate-200 bg-white min-w-0">
                {/* Header */}
                <div className="h-14 border-b border-slate-200 flex items-center justify-between px-4 bg-slate-50 shrink-0">
                    <div className="flex items-center gap-2 min-w-0">
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
                                    {thread?.title || "Untitled Thread"}
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
                            if (confirm("Delete this thread?")) deleteThread.mutate();
                        }}
                        className="shrink-0 text-slate-400 hover:text-red-600 transition-colors"
                        title="Delete Thread"
                    >
                        <Trash2 className="h-4 w-4" />
                    </button>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {messagesLoading ? (
                        <div className="flex justify-center items-center h-full">
                            <Loader2 className="h-6 w-6 animate-spin text-slate-300" />
                        </div>
                    ) : localMessages.length === 0 ? (
                        <div className="flex flex-col justify-center items-center h-full text-slate-400 px-4">
                            <Bot className="h-10 w-10 mb-3 opacity-20" />
                            <p className="text-sm font-medium text-slate-600 text-center">
                                Start a legal analysis
                            </p>
                            <p className="text-xs mt-1 text-center text-slate-400">
                                Ask a question about this document.
                            </p>
                        </div>
                    ) : (
                        localMessages.map((msg) => (
                            <div key={msg.id} className="w-full">
                                {msg.role === "user" ? (
                                    <div className="flex justify-end gap-2">
                                        <div className="bg-slate-900 text-white px-4 py-2.5 rounded-2xl rounded-tr-sm text-sm max-w-[85%]">
                                            {msg.content}
                                        </div>
                                        <div className="flex items-center justify-center shrink-0 w-7 h-7 rounded bg-slate-900 text-white mt-0.5">
                                            <User className="h-4 w-4" />
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex gap-2">
                                        <div className="flex items-center justify-center shrink-0 w-7 h-7 rounded border border-slate-200 bg-white text-slate-700 mt-0.5">
                                            <Bot className="h-4 w-4" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <AssistantMessage content={msg.content} />
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))
                    )}

                    {/* Pending state */}
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
                                        Analyzing document…
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
                            placeholder="Ask a question… (Shift+Enter for new line)"
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
                        TemisAI can make mistakes. Verify critical information.
                    </p>
                </div>
            </div>
        </div>
    );
}

// ─── Assistant message renderer ───────────────────────────────────────────────

function AssistantMessage({ content }: { content: string }) {
    try {
        const parsed = JSON.parse(content);
        if (parsed && typeof parsed.answer === "string") {
            return (
                <div>
                    <p className="text-sm text-slate-800 leading-relaxed whitespace-pre-wrap">
                        {parsed.answer}
                    </p>
                    <ChunkList
                        title="Most Relevant Chunks"
                        chunks={parsed.most_relevant_chunks ?? []}
                        icon={FileText}
                        defaultOpen={false}
                    />
                    <ChunkList
                        title="Constitution References"
                        chunks={parsed.constitution_chunks ?? []}
                        icon={Scale}
                    />
                </div>
            );
        }
    } catch {
        // not JSON
    }

    return (
        <p className="text-sm text-slate-800 leading-relaxed whitespace-pre-wrap">
            {content}
        </p>
    );
}
