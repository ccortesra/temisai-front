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
    DocumentAPIReturn
} from "@/lib/types/api";
import { Send, Loader2, Bot, User, Trash2, Edit2, Check, X, ChevronDown, ChevronRight, FileText, Scale } from "lucide-react";
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


export default function ThreadChatPage() {
    const params = useParams();
    const threadId = params.id as string;
    const router = useRouter();
    const queryClient = useQueryClient();
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const [inputQuery, setInputQuery] = useState("");
    const [selectedDocId, setSelectedDocId] = useState<string>("");
    const [isEditingTitle, setIsEditingTitle] = useState(false);
    const [editTitleValue, setEditTitleValue] = useState("");

    // Queries
    const { data: thread } = useQuery({
        queryKey: ["thread", threadId],
        queryFn: async () => {
            const res = await apiClient.get<ThreadResponse>(`/threads/${threadId}`);
            setEditTitleValue(res.data.title || "Untitled Thread");
            return res.data;
        },
    });

    const { data: messages, isLoading: messagesLoading } = useQuery({
        queryKey: ["thread", threadId, "messages"],
        queryFn: async () => {
            const res = await apiClient.get<MessageResponse[]>(`/threads/${threadId}/messages`);
            return res.data;
        },
        // Keep it fresh, but not real-time since websocket isn't specced
        refetchInterval: 10000
    });

    const { data: documents } = useQuery({
        queryKey: ["documents"],
        queryFn: async () => {
            const res = await apiClient.get<DocumentAPIReturn[]>("/documents");
            return res.data;
        }
    });

    // Mutations
    const updateTitle = useMutation({
        mutationFn: async (newTitle: string) => {
            await apiClient.patch(`/threads/${threadId}`, { title: newTitle });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["thread", threadId] });
            queryClient.invalidateQueries({ queryKey: ["threads"] });
            setIsEditingTitle(false);
        }
    });

    const deleteThread = useMutation({
        mutationFn: async () => {
            await apiClient.delete(`/threads/${threadId}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["threads"] });
            router.push("/documents");
        }
    });

    const chatMutation = useMutation({
        mutationFn: async ({ submittedQuery, docId }: { submittedQuery: string; docId: string }) => {
            const payload = {
                query: submittedQuery,
                doc_id: docId || null
            };
            const res = await apiClient.post<ThreadChatResponse>(`/threads/${threadId}/chat`, payload);
            return res.data;
        },
        onMutate: async ({ submittedQuery }) => {
            // Clear input so user knows it's sent
            setInputQuery("");
            return { submittedQuery };
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["thread", threadId, "messages"] });
        }
    });

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, chatMutation.isPending]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const submittedQuery = inputQuery.trim();
        if (!submittedQuery || chatMutation.isPending) return;
        chatMutation.mutate({ submittedQuery, docId: selectedDocId });
    };

    const handleTitleSubmit = () => {
        if (editTitleValue.trim() && editTitleValue !== thread?.title) {
            updateTitle.mutate(editTitleValue);
        } else {
            setIsEditingTitle(false);
        }
    };

    return (
        <div className="flex flex-col h-full bg-white">
            {/* Thread Header */}
            <div className="h-16 border-b border-slate-200 flex items-center justify-between px-6 bg-slate-50 shrink-0">
                <div className="flex items-center gap-3">
                    {isEditingTitle ? (
                        <div className="flex items-center gap-2">
                            <input
                                type="text"
                                value={editTitleValue}
                                onChange={(e) => setEditTitleValue(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleTitleSubmit()}
                                className="px-2 py-1 text-sm border-slate-300 rounded focus:ring-slate-900 border"
                                autoFocus
                            />
                            <button onClick={handleTitleSubmit} className="text-green-600 hover:text-green-700"><Check className="h-4 w-4" /></button>
                            <button onClick={() => setIsEditingTitle(false)} className="text-slate-400 hover:text-slate-600"><X className="h-4 w-4" /></button>
                        </div>
                    ) : (
                        <>
                            <h2 className="text-lg font-semibold text-slate-800 tracking-tight">
                                {thread?.title || "Untitled Thread"}
                            </h2>
                            <button onClick={() => setIsEditingTitle(true)} className="text-slate-400 hover:text-slate-800 transition-colors">
                                <Edit2 className="h-4 w-4" />
                            </button>
                        </>
                    )}
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

                    <button
                        onClick={() => {
                            if (confirm("Are you sure you want to delete this thread?")) deleteThread.mutate();
                        }}
                        className="text-slate-400 hover:text-red-600 transition-colors"
                        title="Delete Thread"
                    >
                        <Trash2 className="h-5 w-5" />
                    </button>
                </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {messagesLoading ? (
                    <div className="flex justify-center items-center h-full">
                        <Loader2 className="h-8 w-8 animate-spin text-slate-300" />
                    </div>
                ) : (!messages || messages.length === 0) ? (
                    <div className="flex flex-col justify-center items-center h-full text-slate-400">
                        <Bot className="h-12 w-12 mb-4 opacity-20" />
                        <p className="text-lg font-medium text-slate-600">Start a legal analysis</p>
                        <p className="text-sm mt-1 max-w-sm text-center">Ask a question about your uploaded documents or constitutional law.</p>
                    </div>
                ) : (
                    messages.map((msg) => (
                        <div key={msg.id} className={cn(
                            "flex w-full gap-4 max-w-4xl mx-auto",
                            msg.role === "user" ? "flex-row-reverse" : "flex-row"
                        )}>
                            {/* Avatar */}
                            <div className={cn(
                                "flex items-center justify-center shrink-0 w-8 h-8 rounded mt-1 border",
                                msg.role === "user" ? "bg-slate-900 text-white border-slate-900" : "bg-white text-slate-700 border-slate-200"
                            )}>
                                {msg.role === "user" ? <User className="h-5 w-5" /> : <Bot className="h-5 w-5 pt-0.5" />}
                            </div>

                            {/* Message Content */}
                            <div className={cn(
                                "flex-1 overflow-hidden",
                                msg.role === "user" ? "flex flex-col items-end" : "flex flex-col items-start"
                            )}>
                                {msg.role === "user" ? (
                                    <div className="bg-slate-900 text-white px-5 py-3 rounded-2xl rounded-tr-sm text-sm">
                                        {msg.content}
                                    </div>
                                ) : (
                                    <div className="w-full">
                                        {/* We parse the content if it looks like the AgentDocumentReport JSON, 
                          otherwise we just show the text. The backend technically stores the answer string in content, 
                          so we render that directly. But let's check if the frontend needs to handle raw json.
                          The openapi says Assistant message's content is string. 
                          If the backend returns the JSON stringified in 'content', we parse it.
                      */}
                                        {(() => {
                                            try {
                                                // Try to parse if it's JSON
                                                const parsed = JSON.parse(msg.content) as AgentDocumentReport;
                                                return (
                                                    <div className="w-full">
                                                        <div className="prose prose-sm prose-slate max-w-none text-slate-800 leading-relaxed font-sans">
                                                            {parsed.answer}
                                                        </div>

                                                        <div className="mt-4 flex gap-4">
                                                            <ChunkList
                                                                title="Most Relevant Chunks"
                                                                chunks={parsed.most_relevant_chunks}
                                                                icon={FileText}
                                                                defaultOpen={true}
                                                            />
                                                            <ChunkList
                                                                title="Constitution References"
                                                                chunks={parsed.constitution_chunks || []}
                                                                icon={Scale}
                                                            />
                                                        </div>
                                                    </div>
                                                );
                                            } catch (e) {
                                                // Not valid JSON, just render text
                                                return (
                                                    <div className="prose prose-sm prose-slate max-w-none text-slate-800 leading-relaxed">
                                                        {msg.content}
                                                    </div>
                                                );
                                            }
                                        })()}
                                    </div>
                                )}
                            </div>
                        </div>
                    ))
                )}

                {/* Loading Indicator for New Message */}
                {chatMutation.isPending && (
                    <>
                        <div className="flex w-full gap-4 max-w-4xl mx-auto flex-row-reverse">
                            <div className="flex items-center justify-center shrink-0 w-8 h-8 rounded mt-1 border bg-slate-900 text-white border-slate-900">
                                <User className="h-5 w-5" />
                            </div>
                            <div className="flex-1 overflow-hidden flex flex-col items-end">
                                <div className="bg-slate-900 text-white px-5 py-3 rounded-2xl rounded-tr-sm text-sm opacity-70">
                                    {chatMutation.variables?.submittedQuery}
                                </div>
                            </div>
                        </div>
                        <div className="flex w-full gap-4 max-w-4xl mx-auto flex-row">
                            <div className="flex items-center justify-center shrink-0 w-8 h-8 rounded mt-1 border bg-white text-slate-700 border-slate-200">
                                <Loader2 className="h-4 w-4 animate-spin pt-0.5" />
                            </div>
                            <div className="flex-1 flex flex-col items-start pt-2">
                                <span className="text-sm text-slate-500 font-medium animate-pulse">Analyzing legal documents...</span>
                            </div>
                        </div>
                    </>
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
                        placeholder="Ask a legal question... (Shift+Enter for new line)"
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
                <p className="text-center text-xs text-slate-400 mt-2">
                    TemisAI can make mistakes. Consider verifying critical legal information.
                </p>
            </div>
        </div>
    );
}
