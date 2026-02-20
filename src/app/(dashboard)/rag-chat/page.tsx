"use client";

import { useState, useRef, useEffect } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api/client";
import { AgentDocumentReport, DocumentAPIReturn } from "@/lib/types/api";
import { Send, Loader2, Bot, User, ChevronDown, ChevronRight, FileText, Scale } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// Subcomponent: expandable chunk view
function ChunkList({ title, chunks, icon: Icon, defaultOpen = false }: { title: string, chunks: any[], icon: any, defaultOpen?: boolean }) {
    const [isOpen, setIsOpen] = useState(defaultOpen);
    if (!chunks || chunks.length === 0) return null;

    return (
        <div className="mt-4 border border-slate-200 rounded-md bg-white overflow-hidden text-sm">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center justify-between p-3 bg-slate-50 hover:bg-slate-100 transition-colors text-slate-700 font-medium"
            >
                <span className="flex items-center gap-2">
                    <Icon className="h-4 w-4 text-slate-500" />
                    {title} ({chunks.length})
                </span>
                {isOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
            </button>

            {isOpen && (
                <div className="p-0 border-t border-slate-200 h-64 overflow-y-auto">
                    <ul className="divide-y divide-slate-100">
                        {chunks.map((chunk, idx) => (
                            <li key={chunk.id || idx} className="p-3">
                                <div className="text-xs font-semibold text-slate-500 mb-1 flex justify-between">
                                    <span>Page {chunk.page !== undefined ? chunk.page : 'N/A'}</span>
                                    {chunk.document_id && <span className="text-slate-400 select-all font-mono">Doc: {chunk.document_id.substring(0, 8)}</span>}
                                </div>
                                <p className="text-slate-600 whitespace-pre-wrap">{chunk.content}</p>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
}

type ChatTurn = {
    id: string;
    query: string;
    response: AgentDocumentReport | null;
    error?: string;
    isLoading?: boolean;
};

export default function RagChatPage() {
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const [inputQuery, setInputQuery] = useState("");
    const [selectedDocId, setSelectedDocId] = useState<string>("");
    const [turns, setTurns] = useState<ChatTurn[]>([]);

    // Queries
    const { data: documents } = useQuery({
        queryKey: ["documents"],
        queryFn: async () => {
            const res = await apiClient.get<DocumentAPIReturn[]>("/documents");
            return res.data;
        }
    });

    // Since this is true stateless RAG, there is no thread DB storage based on OpenAPI. 
    // We keep the state strictly in-memory during the session.
    const chatMutation = useMutation({
        mutationFn: async ({ turnId, submittedQuery }: { turnId: string; submittedQuery: string }) => {
            const payload = {
                query: submittedQuery,
                doc_id: selectedDocId || null
            };
            // For stateless RAG, openapi states /rag-chat returns "Successful Response"
            // but the exact schema isn't provided (schema: {}). 
            // We assume it returns an AgentDocumentReport directly or similar JSON.
            const res = await apiClient.post<AgentDocumentReport>(`/rag-chat`, payload);
            return { turnId, data: res.data };
        },
        onMutate: ({ submittedQuery }) => {
            const turnId = Date.now().toString();
            const newTurn: ChatTurn = {
                id: turnId,
                query: submittedQuery,
                response: null,
                isLoading: true
            };
            setTurns(prev => [...prev, newTurn]);
            setInputQuery("");
            return turnId;
        },
        onSuccess: ({ turnId, data }) => {
            setTurns(prev => prev.map(t =>
                t.id === turnId ? { ...t, response: data, isLoading: false } : t
            ));
        },
        onError: (error: any, { turnId }) => {
            setTurns(prev => prev.map(t =>
                t.id === turnId ? {
                    ...t,
                    isLoading: false,
                    error: error.response?.data?.detail?.[0]?.msg || "An error occurred during verification."
                } : t
            ));
        }
    });

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [turns]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const submittedQuery = inputQuery.trim();
        if (!submittedQuery || chatMutation.isPending) return;

        chatMutation.mutate({ turnId: Date.now().toString(), submittedQuery });
    };

    return (
        <div className="flex flex-col h-full bg-white">
            {/* Header */}
            <div className="h-16 border-b border-slate-200 flex items-center justify-between px-6 bg-slate-50 shrink-0">
                <div className="flex items-center gap-3">
                    <h2 className="text-lg font-semibold text-slate-800 tracking-tight">
                        Stateless RAG Search
                    </h2>
                    <span className="text-xs bg-slate-200 text-slate-600 px-2 py-0.5 rounded-full font-medium">Not Saved</span>
                </div>

                <div className="flex items-center gap-4">
                    <select
                        className="text-sm border-slate-300 rounded-md py-1.5 pl-3 pr-8 focus:ring-slate-900 focus:border-slate-900 bg-white"
                        value={selectedDocId}
                        onChange={(e) => setSelectedDocId(e.target.value)}
                    >
                        <option value="">All Documents (Full RAG)</option>
                        {documents?.map(doc => (
                            <option key={doc.id} value={doc.id}>{doc.filename}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {turns.length === 0 ? (
                    <div className="flex flex-col justify-center items-center h-full text-slate-400">
                        <Scale className="h-12 w-12 mb-4 opacity-20" />
                        <p className="text-lg font-medium text-slate-600">Quick Legal Query</p>
                        <p className="text-sm mt-1 max-w-sm text-center">
                            Ask a one-off question. This conversation is not saved to a thread and has no memory of previous messages.
                        </p>
                    </div>
                ) : (
                    turns.map((turn) => (
                        <div key={turn.id} className="space-y-6">
                            {/* User Query */}
                            <div className="flex w-full gap-4 max-w-4xl mx-auto flex-row-reverse">
                                <div className="flex items-center justify-center shrink-0 w-8 h-8 rounded mt-1 border bg-slate-900 text-white border-slate-900">
                                    <User className="h-5 w-5" />
                                </div>
                                <div className="flex-1 overflow-hidden flex flex-col items-end">
                                    <div className="bg-slate-900 text-white px-5 py-3 rounded-2xl rounded-tr-sm text-sm">
                                        {turn.query}
                                    </div>
                                </div>
                            </div>

                            {/* Assistant Response */}
                            <div className="flex w-full gap-4 max-w-4xl mx-auto flex-row">
                                <div className="flex items-center justify-center shrink-0 w-8 h-8 rounded mt-1 border bg-white text-slate-700 border-slate-200">
                                    <Bot className="h-5 w-5 pt-0.5" />
                                </div>
                                <div className="flex-1 overflow-hidden flex flex-col items-start">
                                    {turn.isLoading ? (
                                        <span className="text-sm text-slate-500 font-medium animate-pulse pt-2">Searching legal documents...</span>
                                    ) : turn.error ? (
                                        <div className="text-sm text-red-600 bg-red-50 px-4 py-3 rounded border border-red-100">
                                            {turn.error}
                                        </div>
                                    ) : turn.response ? (
                                        <div className="w-full">
                                            <div className="prose prose-sm prose-slate max-w-none text-slate-800 leading-relaxed font-sans">
                                                {turn.response.answer}
                                            </div>

                                            <div className="mt-4 flex gap-4">
                                                <ChunkList
                                                    title="Most Relevant Chunks"
                                                    chunks={turn.response.most_relevant_chunks || []}
                                                    icon={FileText}
                                                    defaultOpen={true}
                                                />
                                                <ChunkList
                                                    title="Constitution References"
                                                    chunks={turn.response.constitution_chunks || []}
                                                    icon={Scale}
                                                />
                                            </div>
                                        </div>
                                    ) : null}
                                </div>
                            </div>
                        </div>
                    ))
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 bg-white border-t border-slate-200 shrink-0">
                <form onSubmit={handleSubmit} className="max-w-4xl mx-auto relative flex items-end shadow-sm">
                    <textarea
                        value={inputQuery}
                        onChange={(e) => setInputQuery(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                handleSubmit(e);
                            }
                        }}
                        placeholder="Search documents... (Shift+Enter for new line)"
                        className="w-full resize-none min-h-[56px] max-h-[200px] border border-slate-300 rounded-lg py-3 pl-4 pr-14 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent no-scrollbar"
                        rows={1}
                        disabled={chatMutation.isPending}
                    />
                    <Button
                        type="submit"
                        size="icon"
                        disabled={!inputQuery.trim() || chatMutation.isPending}
                        className="absolute right-2 bottom-2 h-10 w-10 bg-slate-900 rounded-md shadow-sm transition-transform active:scale-95"
                    >
                        <Send className="h-4 w-4" />
                    </Button>
                </form>
            </div>
        </div>
    );
}
