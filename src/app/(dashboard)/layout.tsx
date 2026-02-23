"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { LogOut, FileText, MessageSquare, Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { apiClient } from "@/lib/api/client";
import { useQuery } from "@tanstack/react-query";
import { ThreadResponse } from "@/lib/types/api";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { isAuthenticated, logout } = useAuth();
    const router = useRouter();
    const pathname = usePathname();
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

    if (!isAuthenticated) return null;

    return (
        <div className="flex h-screen bg-slate-50 overflow-hidden">
            {/* Mobile sidebar overlay */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 z-40 bg-slate-900/50 md:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside className={cn(
                "fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 text-slate-300 transition-transform duration-300 ease-in-out md:relative md:translate-x-0 flex flex-col",
                sidebarOpen ? "translate-x-0" : "-translate-x-full"
            )}>
                <div className="flex items-center justify-between h-16 px-4 border-b border-slate-800">
                    <span className="text-lg font-semibold text-white tracking-tight">TemisAI</span>
                    <button className="md:hidden" onClick={() => setSidebarOpen(false)}>
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto py-4">
                    <nav className="space-y-1 px-2">
                        <Link href="/documents" className={cn(
                            "flex items-center px-2 py-2 text-sm font-medium rounded-md",
                            pathname === "/documents" || pathname === "/" ? "bg-slate-800 text-white" : "hover:bg-slate-800 hover:text-white"
                        )}>
                            <FileText className="mr-3 flex-shrink-0 h-5 w-5" />
                            Documents
                        </Link>

                        <div className="pt-4 pb-2">
                            <div className="flex items-center px-2 mb-2">
                                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                    Threads
                                </p>
                            </div>

                            <div className="space-y-1">
                                {threads?.map((thread) => (
                                    <Link
                                        key={thread.id}
                                        href={`/threads/${thread.id}`}
                                        className={cn(
                                            "flex items-center px-2 py-2 text-sm font-medium rounded-md",
                                            pathname === `/threads/${thread.id}` ? "bg-slate-800 text-white" : "hover:bg-slate-800 hover:text-white"
                                        )}
                                    >
                                        <MessageSquare className="mr-3 flex-shrink-0 h-4 w-4 text-slate-500" />
                                        <span className="truncate">{thread.title || "Untitled Thread"}</span>
                                    </Link>
                                ))}

                                {threads?.length === 0 && (
                                    <p className="px-2 text-sm text-slate-500 italic">No threads yet</p>
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
                        Sign Out
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                <header className="bg-white shadow-sm h-16 flex items-center px-4 md:hidden z-10">
                    <button
                        onClick={() => setSidebarOpen(true)}
                        className="text-slate-500 hover:text-slate-900 focus:outline-none"
                    >
                        <Menu className="h-6 w-6" />
                    </button>
                    <span className="ml-4 font-semibold text-slate-900">TemisAI</span>
                </header>

                <main className="flex-1 relative overflow-y-auto focus:outline-none">
                    {children}
                </main>
            </div>
        </div>
    );
}
