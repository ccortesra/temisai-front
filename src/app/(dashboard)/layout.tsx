"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import {
    LogOut,
    FileText,
    MessageSquare,
    Menu,
    X,
    Scale,
    ScanText,
    Plus,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { apiClient } from "@/lib/api/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ThreadResponse } from "@/lib/types/api";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { isAuthenticated, logout } = useAuth();
    const router = useRouter();
    const pathname = usePathname();
    const queryClient = useQueryClient();
    const [sidebarOpen, setSidebarOpen] = useState(false);

    useEffect(() => {
        if (!isAuthenticated) {
            router.push("/login");
        }
    }, [isAuthenticated, router]);

    const { data: threads } = useQuery({
        queryKey: ["threads"],
        queryFn: async () => {
            const res = await apiClient.get<ThreadResponse[]>("/threads");
            return res.data;
        },
        enabled: isAuthenticated,
    });

    const chatLegalThreads = useMemo(
        () => threads?.filter((t) => !t.doc_id) ?? [],
        [threads]
    );

    const ocrExpertThreads = useMemo(
        () => threads?.filter((t) => !!t.doc_id) ?? [],
        [threads]
    );

    const createChatLegal = useMutation({
        mutationFn: async () => {
            const res = await apiClient.post<ThreadResponse>("/threads", {});
            return res.data;
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ["threads"] });
            router.push(`/threads/${data.id}`);
        },
    });

    if (!isAuthenticated) return null;

    return (
        <div className="flex h-screen bg-slate-50 overflow-hidden">
            {sidebarOpen && (
                <div
                    className="fixed inset-0 z-40 bg-slate-900/50 md:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            <aside
                className={cn(
                    "fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 text-slate-300 transition-transform duration-300 ease-in-out md:relative md:translate-x-0 flex flex-col",
                    sidebarOpen ? "translate-x-0" : "-translate-x-full"
                )}
            >
                <div className="flex items-center justify-between h-16 px-4 border-b border-slate-800">
                    <Link
                        href="/documents"
                        className="text-lg font-semibold text-white tracking-tight hover:text-slate-200 transition-colors"
                    >
                        TemisAI
                    </Link>
                    <button
                        className="md:hidden"
                        onClick={() => setSidebarOpen(false)}
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto py-4">
                    <nav className="space-y-1 px-2">
                        <Link
                            href="/documents"
                            className={cn(
                                "flex items-center px-2 py-2 text-sm font-medium rounded-md",
                                pathname === "/documents" || pathname === "/"
                                    ? "bg-slate-800 text-white"
                                    : "hover:bg-slate-800 hover:text-white"
                            )}
                        >
                            <FileText className="mr-3 flex-shrink-0 h-5 w-5" />
                            Documentos
                        </Link>

                        {/* ── ChatLegal section ── */}
                        <div className="pt-5 pb-2">
                            <div className="flex items-center justify-between px-2 mb-2">
                                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                                    <Scale className="h-3 w-3" />
                                    ChatLegal
                                </p>
                                <button
                                    onClick={() => createChatLegal.mutate()}
                                    disabled={createChatLegal.isPending}
                                    className="text-slate-500 hover:text-white transition-colors"
                                    title="Nuevo chat legal"
                                >
                                    <Plus className="h-3.5 w-3.5" />
                                </button>
                            </div>

                            <div className="space-y-0.5">
                                {chatLegalThreads.map((thread) => (
                                    <Link
                                        key={thread.id}
                                        href={`/threads/${thread.id}`}
                                        className={cn(
                                            "flex items-center px-2 py-1.5 text-sm font-medium rounded-md",
                                            pathname === `/threads/${thread.id}`
                                                ? "bg-slate-800 text-white"
                                                : "hover:bg-slate-800 hover:text-white"
                                        )}
                                    >
                                        <Scale className="mr-2.5 flex-shrink-0 h-3.5 w-3.5 text-emerald-500" />
                                        <span className="truncate">
                                            {thread.title || "Nuevo chat"}
                                        </span>
                                    </Link>
                                ))}

                                {chatLegalThreads.length === 0 && (
                                    <p className="px-2 text-xs text-slate-500 italic">
                                        Aun no hay conversaciones
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* ── Experto OCR section ── */}
                        <div className="pt-3 pb-2">
                            <div className="flex items-center px-2 mb-2">
                                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                                    <ScanText className="h-3 w-3" />
                                    Experto OCR
                                </p>
                            </div>

                            <div className="space-y-0.5">
                                {ocrExpertThreads.map((thread) => (
                                    <Link
                                        key={thread.id}
                                        href={`/threads/${thread.id}`}
                                        className={cn(
                                            "flex items-center px-2 py-1.5 text-sm font-medium rounded-md",
                                            pathname === `/threads/${thread.id}`
                                                ? "bg-slate-800 text-white"
                                                : "hover:bg-slate-800 hover:text-white"
                                        )}
                                    >
                                        <ScanText className="mr-2.5 flex-shrink-0 h-3.5 w-3.5 text-amber-500" />
                                        <span className="truncate">
                                            {thread.title || "Sin titulo"}
                                        </span>
                                    </Link>
                                ))}

                                {ocrExpertThreads.length === 0 && (
                                    <p className="px-2 text-xs text-slate-500 italic">
                                        Empieza desde la pagina de Documentos
                                    </p>
                                )}
                            </div>
                        </div>
                    </nav>
                </div>

                <div className="p-4 border-t border-slate-800">
                    <button
                        onClick={logout}
                        className="flex items-center w-full px-2 py-2 text-sm font-medium text-slate-300 rounded-md hover:bg-slate-800 hover:text-white transition-colors"
                    >
                        <LogOut className="mr-3 h-5 w-5" />
                        Cerrar sesion
                    </button>
                </div>
            </aside>

            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                <header className="bg-white shadow-sm h-16 flex items-center px-4 md:hidden z-10">
                    <button
                        onClick={() => setSidebarOpen(true)}
                        className="text-slate-500 hover:text-slate-900 focus:outline-none"
                    >
                        <Menu className="h-6 w-6" />
                    </button>
                    <Link
                        href="/"
                        className="ml-4 font-semibold text-slate-900 hover:text-slate-700 transition-colors"
                    >
                        TemisAI
                    </Link>
                </header>

                <main className="flex-1 relative min-h-0 overflow-y-auto focus:outline-none">
                    {children}
                </main>
            </div>
        </div>
    );
}
