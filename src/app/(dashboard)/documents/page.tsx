"use client";

import { useState, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api/client";
import { DocumentAPIReturn, ThreadResponse } from "@/lib/types/api";
import { UploadCloud, Trash2, File as FileIcon, Loader2, AlertCircle, ScanText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { useRouter } from "next/navigation";

export default function DocumentsPage() {
    const queryClient = useQueryClient();
    const router = useRouter();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [uploadError, setUploadError] = useState<string | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [creatingThreadForDoc, setCreatingThreadForDoc] = useState<string | null>(null);

    // Fetch Documents
    const { data: documents, isLoading, isError } = useQuery({
        queryKey: ["documents"],
        queryFn: async () => {
            const res = await apiClient.get<DocumentAPIReturn[]>("/documents");
            return res.data;
        },
    });

    const createThreadMutation = useMutation({
        mutationFn: async (doc: DocumentAPIReturn) => {
            const res = await apiClient.post<ThreadResponse>("/threads", {
                title: doc.filename,
                doc_id: doc.id,
            });
            return res.data;
        },
        onSuccess: (thread) => {
            queryClient.invalidateQueries({ queryKey: ["threads"] });
            router.push(`/threads/${thread.id}`);
        },
        onError: (err: any) => {
            alert(err.response?.data?.detail?.[0]?.msg || "Failed to create thread");
            setCreatingThreadForDoc(null);
        },
    });

    // Delete Document Mutation
    const deleteMutation = useMutation({
        mutationFn: async (docId: string) => {
            await apiClient.delete(`/documents/${docId}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["documents"] });
        },
        onError: (error: any) => {
            alert(error.response?.data?.detail?.[0]?.msg || "Failed to delete document");
        }
    });

    // Handle File Output
    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploadError(null);
        setIsUploading(true);

        const formData = new FormData();
        formData.append("file", file);

        try {
            await apiClient.post("/ingest", formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });
            // Invalidate both documents and possibly other queries based on success
            queryClient.invalidateQueries({ queryKey: ["documents"] });
            if (fileInputRef.current) fileInputRef.current.value = "";
        } catch (err: any) {
            setUploadError(
                err.response?.data?.detail?.[0]?.msg ||
                err.message ||
                "Failed to upload document. Please ensure it's a valid PDF."
            );
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <div className="p-6 md:p-10 max-w-6xl mx-auto space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Legal Documents</h1>
                <p className="text-slate-500 mt-2">Manage your uploaded legal documents and evidence base.</p>
            </div>

            {/* Upload Section */}
            <section>
                <div className="border-2 border-dashed border-slate-300 rounded-lg p-8 text-center bg-white hover:bg-slate-50 transition-colors">
                    <UploadCloud className="mx-auto h-12 w-12 text-slate-400 mb-4" />
                    <h3 className="text-sm font-medium text-slate-900">Upload New Document</h3>
                    <p className="text-xs text-slate-500 mt-1 mb-4">Must be a valid PDF document.</p>

                    <input
                        type="file"
                        accept="application/pdf"
                        className="hidden"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        disabled={isUploading}
                    />

                    <Button
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isUploading}
                        className="bg-slate-900 text-white"
                    >
                        {isUploading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Ingesting...
                            </>
                        ) : (
                            "Browse Files"
                        )}
                    </Button>

                    {uploadError && (
                        <div className="mt-4 p-3 flex items-center justify-center text-sm text-red-700 bg-red-50 border border-red-200 rounded-md">
                            <AlertCircle className="h-4 w-4 mr-2" />
                            {uploadError}
                        </div>
                    )}
                </div>
            </section>

            {/* Documents List */}
            <section>
                <h2 className="text-xl font-semibold tracking-tight text-slate-900 mb-4">Your Repository</h2>

                {isLoading && (
                    <div className="flex justify-center py-12">
                        <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
                    </div>
                )}

                {isError && (
                    <div className="text-center py-12 text-red-500">
                        Failed to load documents. Please try refreshing.
                    </div>
                )}

                {documents && documents.length === 0 && (
                    <div className="text-center py-12 bg-white border border-slate-200 rounded-lg">
                        <FileIcon className="mx-auto h-12 w-12 text-slate-300 mb-3" />
                        <h3 className="text-sm font-medium text-slate-900">No documents</h3>
                        <p className="text-sm text-slate-500 mt-1">Get started by uploading your first legal document.</p>
                    </div>
                )}

                {documents && documents.length > 0 && (
                    <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
                        <ul className="divide-y divide-slate-200">
                            {documents.map((doc) => (
                                <li key={doc.id} className="p-4 hover:bg-slate-50 flex items-center justify-between transition-colors">
                                    <div className="flex items-center min-w-0">
                                        <div className="flex-shrink-0 h-10 w-10 bg-slate-100 rounded-lg flex items-center justify-center border border-slate-200">
                                            <FileIcon className="h-5 w-5 text-slate-500" />
                                        </div>
                                        <div className="ml-4 min-w-0 flex-1">
                                            <p className="text-sm font-medium text-slate-900 truncate">
                                                {doc.filename}
                                            </p>
                                            <p className="text-xs text-slate-500 truncate mt-0.5">
                                                Uploaded on {doc.created_at ? format(new Date(doc.created_at), 'MMM d, yyyy h:mm a') : 'Unknown date'}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="ml-4 flex-shrink-0 flex items-center space-x-2">
                                        <button
                                            onClick={() => {
                                                setCreatingThreadForDoc(doc.id);
                                                createThreadMutation.mutate(doc);
                                            }}
                                            disabled={creatingThreadForDoc === doc.id}
                                            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-md transition-colors"
                                            title="Analyze this document with OCR Expert"
                                        >
                                            {creatingThreadForDoc === doc.id ? (
                                                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                            ) : (
                                                <ScanText className="h-3.5 w-3.5" />
                                            )}
                                            OCR Expert
                                        </button>
                                        <button
                                            onClick={() => {
                                                if (confirm("Are you sure you want to delete this document? This cannot be undone.")) {
                                                    deleteMutation.mutate(doc.id);
                                                }
                                            }}
                                            disabled={deleteMutation.isPending && deleteMutation.variables === doc.id}
                                            className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                                            title="Delete document"
                                        >
                                            {deleteMutation.isPending && deleteMutation.variables === doc.id ? (
                                                <Loader2 className="h-4 w-4 animate-spin text-red-500" />
                                            ) : (
                                                <Trash2 className="h-4 w-4" />
                                            )}
                                        </button>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </section>
        </div>
    );
}
