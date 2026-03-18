"use client";

import { useState, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api/client";
import { DocumentAPIReturn, ThreadResponse } from "@/lib/types/api";
import { UploadCloud, Trash2, File as FileIcon, Loader2, AlertCircle, ScanText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { useRouter } from "next/navigation";

export default function DocumentsPage() {
    const queryClient = useQueryClient();
    const router = useRouter();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [uploadError, setUploadError] = useState<string | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [creatingThreadForDoc, setCreatingThreadForDoc] = useState<string | null>(null);
    const maxDocsErrorText = "User has reached the maximum number of OCR documents.";
    const hasReachedMaxDocs = !!uploadError && (
        uploadError.includes(maxDocsErrorText)
    );

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
            alert(err.response?.data?.detail?.[0]?.msg || "No se pudo crear la conversacion");
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
            alert(error.response?.data?.detail?.[0]?.msg || "No se pudo eliminar el documento");
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
            const detail = err.response?.data?.detail;
            setUploadError(
                (typeof detail === "string" && detail) ||
                detail?.[0]?.msg ||
                err.message ||
                "No se pudo subir el documento. Asegurate de que sea un PDF valido."
            );
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <div className="p-6 md:p-10 max-w-6xl mx-auto space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Documentos legales</h1>
                <p className="text-slate-500 mt-2">Gestiona tus documentos legales subidos y tu base de evidencia.</p>
            </div>

            <section className="rounded-xl border border-slate-200 bg-white p-5 md:p-6 md:max-h-[50vh] md:overflow-y-auto">
                <h2 className="text-lg font-semibold text-slate-900">Como funciona TemisAI</h2>
                <p className="mt-2 text-sm text-slate-600">
                    TemisAI te ayuda a investigar derecho y analizar documentos con IA en un solo espacio.
                    Es una IA super especializada en derecho colombiano, con acceso a documentos legales indexados para optimizar el rendimiento.
                </p>
                <p className="mt-2 text-sm text-slate-600">
                    Actualmente tiene acceso a los siguientes documentos legales:
                </p>
                <ul className="mt-2 list-disc pl-5 text-sm text-slate-700 space-y-1">
                    <li>Codigo Civil</li>
                    <li>Constitucion Politica</li>
                    <li>Ley 820 de 2003 (Inmobiliario)</li>
                    <li>Codigo Sustantivo del trabajo</li>
                </ul>
                <div className="mt-4 space-y-2 text-sm text-slate-700">
                    <p><span className="font-semibold text-slate-900">ChatLegal:</span> Haz preguntas legales sin adjuntar un documento.</p>
                    <p><span className="font-semibold text-slate-900">Experto OCR:</span> Analiza un documento subido con fragmentos citados. Primero debes subir el documento en la seccion de documentos y luego usar el boton Experto OCR sobre el documento para preguntas especificas.</p>
                </div>
                <p className="mt-4 text-sm text-slate-700">
                    Tutorial rapido: 
                    <ol>
                        <li>Sube un PDF aqui.</li>
                        <li>Usa ChatLegal desde la barra lateral para investigacion legal general.</li>
                        <li>Reabre conversaciones cuando quieras desde la barra lateral.</li>
                    </ol>   
                </p>

                <p>Correo de soporte: <a href="mailto:temisaicolombia@gmail.com" className="text-blue-500">temisaicolombia@gmail.com</a></p>
            </section>

            {/* Upload Section */}
            <section>
                <div className="border-2 border-dashed border-slate-300 rounded-lg p-8 text-center bg-white hover:bg-slate-50 transition-colors">
                    <UploadCloud className="mx-auto h-12 w-12 text-slate-400 mb-4" />
                    <h3 className="text-sm font-medium text-slate-900">Subir nuevo documento</h3>
                    <p className="text-xs text-slate-500 mt-1 mb-4">Debe ser un documento PDF valido.</p>

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
                                Procesando...
                            </>
                        ) : (
                            "Explorar archivos"
                        )}
                    </Button>

                    {hasReachedMaxDocs && (
                        <div className="mt-4 rounded-lg border border-amber-300 bg-amber-50 p-4 text-left">
                            <div className="flex items-start gap-2 text-amber-900">
                                <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                                <div>
                                    <p className="text-sm font-semibold">
                                        Alcanzaste el maximo de documentos OCR de tu plan.
                                    </p>
                                    <p className="text-xs mt-1 text-amber-800">
                                        Para obtener un mejor plan, contactanos en{" "}
                                        <a
                                            href="mailto:temisaicolombia@gmail.com"
                                            className="font-semibold underline decoration-amber-700 underline-offset-2"
                                        >
                                            temisaicolombia@gmail.com
                                        </a>
                                        .
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {uploadError && !hasReachedMaxDocs && (
                        <div className="mt-4 p-3 flex items-center justify-center text-sm text-red-700 bg-red-50 border border-red-200 rounded-md">
                            <AlertCircle className="h-4 w-4 mr-2" />
                            {uploadError}
                        </div>
                    )}
                </div>
            </section>

            {/* Documents List */}
            <section>
                <h2 className="text-xl font-semibold tracking-tight text-slate-900 mb-4">Tu repositorio</h2>

                {isLoading && (
                    <div className="flex justify-center py-12">
                        <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
                    </div>
                )}

                {isError && (
                    <div className="text-center py-12 text-red-500">
                        No se pudieron cargar los documentos. Intenta actualizar.
                    </div>
                )}

                {documents && documents.length === 0 && (
                    <div className="text-center py-12 bg-white border border-slate-200 rounded-lg">
                        <FileIcon className="mx-auto h-12 w-12 text-slate-300 mb-3" />
                        <h3 className="text-sm font-medium text-slate-900">Sin documentos</h3>
                        <p className="text-sm text-slate-500 mt-1">Empieza subiendo tu primer documento legal.</p>
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
                                                Subido el {doc.created_at ? format(new Date(doc.created_at), "d 'de' MMM yyyy, HH:mm", { locale: es }) : "Fecha desconocida"}
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
                                            title="Analizar este documento con Experto OCR"
                                        >
                                            {creatingThreadForDoc === doc.id ? (
                                                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                            ) : (
                                                <ScanText className="h-3.5 w-3.5" />
                                            )}
                                            Experto OCR
                                        </button>
                                        <button
                                            onClick={() => {
                                                if (confirm("Seguro que deseas eliminar este documento? Esta accion no se puede deshacer.")) {
                                                    deleteMutation.mutate(doc.id);
                                                }
                                            }}
                                            disabled={deleteMutation.isPending && deleteMutation.variables === doc.id}
                                            className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                                            title="Eliminar documento"
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
