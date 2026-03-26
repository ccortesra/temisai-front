"use client";

import { useState } from "react";
import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { apiClient } from "@/lib/api/client";

type AccessRequestResponse = {
    message: string;
};

export default function SolicitarAccesoPage() {
    const [nombre, setNombre] = useState("");
    const [email, setEmail] = useState("");
    const [aceptaInfo, setAceptaInfo] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [enviado, setEnviado] = useState(false);
    const [isSending, setIsSending] = useState(false);

    const onSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (!nombre.trim() || !email.trim()) {
            setError("Completa tu nombre y correo electronico.");
            return;
        }

        if (!aceptaInfo) {
            setError("Debes aceptar recibir informacion en tu correo.");
            return;
        }

        setIsSending(true);
        try {
            await apiClient.post<AccessRequestResponse>("/request-access", {
                email: email.trim(),
                name: nombre.trim(),
            });
            setEnviado(true);
        } catch (err: any) {
            setError(
                err.response?.data?.detail ||
                    err.response?.data?.detail?.[0]?.msg ||
                    err.message ||
                    "No se pudo enviar la solicitud. Intenta de nuevo."
            );
        } finally {
            setIsSending(false);
        }
    };

    return (
        <main className="min-h-screen bg-slate-950 text-slate-100 overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(16,185,129,0.16),transparent_38%),radial-gradient(circle_at_80%_10%,rgba(59,130,246,0.14),transparent_34%),radial-gradient(circle_at_60%_85%,rgba(245,158,11,0.1),transparent_34%)]" />
            <div className="relative mx-auto flex min-h-screen w-full max-w-3xl items-center justify-center p-6 md:p-10">
                <section className="w-full rounded-3xl border border-slate-800/80 bg-white p-6 sm:p-8 md:p-10 text-slate-900 shadow-2xl">
                    <div className="mb-7">
                        <Link href="/login" className="text-sm font-semibold text-slate-500">
                            Volver a inicio de sesion
                        </Link>
                        <h1 className="mt-2 text-2xl font-semibold tracking-tight">
                            Solicitar acceso
                        </h1>
                        <p className="mt-1 text-sm text-slate-500">
                            Dejanos tus datos y te contactaremos para habilitar acceso a
                            TemisAI.
                        </p>
                    </div>

                    {enviado ? (
                        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-emerald-900">
                            <div className="flex items-start gap-3">
                                <CheckCircle2 className="mt-0.5 h-5 w-5 text-emerald-600" />
                                <div>
                                    <p className="text-sm font-semibold">
                                        Solicitud enviada correctamente
                                    </p>
                                    <p className="mt-1 text-sm">
                                        Gracias, pronto nos pondremos en contacto contigo al
                                        correo registrado.
                                    </p>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <form onSubmit={onSubmit} className="space-y-5">
                            {error && (
                                <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                                    {error}
                                </div>
                            )}

                            <div>
                                <label
                                    htmlFor="nombre"
                                    className="block text-sm font-medium text-slate-700 mb-1"
                                >
                                    Nombre completo
                                </label>
                                <input
                                    id="nombre"
                                    type="text"
                                    value={nombre}
                                    onChange={(e) => setNombre(e.target.value)}
                                    required
                                    className="w-full rounded-md border border-slate-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-slate-900"
                                    placeholder="Tu nombre"
                                />
                            </div>

                            <div>
                                <label
                                    htmlFor="email"
                                    className="block text-sm font-medium text-slate-700 mb-1"
                                >
                                    Correo electronico
                                </label>
                                <input
                                    id="email"
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    className="w-full rounded-md border border-slate-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-slate-900"
                                    placeholder="tu@correo.com"
                                />
                            </div>

                            <label className="flex items-start gap-2 text-sm text-slate-700">
                                <input
                                    type="checkbox"
                                    checked={aceptaInfo}
                                    onChange={(e) => setAceptaInfo(e.target.checked)}
                                    className="mt-0.5 h-4 w-4 rounded border-slate-300 text-slate-900 focus:ring-slate-900"
                                />
                                Acepto recibir informacion en mi correo electronico sobre el
                                acceso a TemisAI.
                            </label>

                            <button
                                type="submit"
                                disabled={isSending}
                                className="w-full rounded-md bg-slate-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-60 disabled:cursor-not-allowed"
                            >
                                {isSending ? "Enviando solicitud..." : "Enviar solicitud"}
                            </button>
                        </form>
                    )}
                </section>
            </div>
        </main>
    );
}
