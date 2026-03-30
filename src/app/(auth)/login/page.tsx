"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { apiClient } from "@/lib/api/client";
import Link from "next/link";
import { ShieldCheck, Scale, Sparkles } from "lucide-react";

export default function LoginPage() {
    const { login } = useAuth();
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setIsLoading(true);

        try {
            const params = new URLSearchParams();
            params.append("username", username);
            params.append("password", password);

            const response = await apiClient.post("/token", params, {
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded",
                },
            });

            // The OpenAPI spec doesn't detail exactly the response shape of /token,
            // but standard OAuth2 password flow returns { access_token: "..." }
            const token = response.data.access_token || response.data.token;
            if (token) {
                login(token);
            } else {
                throw new Error("No se recibio token");
            }
        } catch (err: any) {
            setError(
                err.response?.data?.detail || err.message || "Credenciales invalidas."
            );
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="relative min-h-screen bg-slate-950 text-slate-100 overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(16,185,129,0.16),transparent_38%),radial-gradient(circle_at_80%_10%,rgba(59,130,246,0.14),transparent_34%),radial-gradient(circle_at_60%_85%,rgba(245,158,11,0.1),transparent_34%)]" />
            <div className="relative mx-auto flex min-h-screen w-full max-w-6xl items-center justify-center p-6 md:p-10">
                <div className="grid w-full overflow-hidden rounded-3xl border border-slate-800/80 bg-slate-900/80 shadow-2xl backdrop-blur md:grid-cols-2">
                    <section className="hidden md:flex flex-col justify-between p-10 bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800 border-r border-slate-800">
                        <div>
                            <h1 className="text-3xl font-semibold tracking-tight text-white">
                                Espacio Legal TemisAI
                            </h1>
                            <p className="mt-3 text-sm text-slate-300 leading-relaxed">
                                Investiga mas rapido, analiza mejor y manten cada conversacion
                                legal organizada en un solo espacio moderno.
                            </p>
                        </div>

                        <div className="space-y-3">
                            <div className="flex items-start gap-3 rounded-xl border border-slate-800 bg-slate-900/60 p-3">
                                <Scale className="mt-0.5 h-4 w-4 text-emerald-400" />
                                <p className="text-sm text-slate-300">
                                    ChatLegal para investigacion legal inmediata sobre tu
                                    corpus juridico vectorizado.
                                </p>
                            </div>
                            <div className="flex items-start gap-3 rounded-xl border border-slate-800 bg-slate-900/60 p-3">
                                <ShieldCheck className="mt-0.5 h-4 w-4 text-blue-400" />
                                <p className="text-sm text-slate-300">
                                    Experto OCR para revisar evidencia documental con
                                    fragmentos citados y contexto legal.
                                </p>
                            </div>
                            <div className="flex items-start gap-3 rounded-xl border border-slate-800 bg-slate-900/60 p-3">
                                <Sparkles className="mt-0.5 h-4 w-4 text-amber-400" />
                                <p className="text-sm text-slate-300">
                                    Hecho para profesionales del derecho que necesitan
                                    velocidad y trazabilidad.
                                </p>
                            </div>
                        </div>
                    </section>

                    <section className="p-6 sm:p-8 md:p-10 bg-white text-slate-900">
                        <div className="mb-7">
                            <Link href="/" className="text-sm font-semibold text-slate-500">
                                TemisAI
                            </Link>
                            <h2 className="mt-2 text-2xl font-semibold tracking-tight">
                                Bienvenido de nuevo
                            </h2>
                            <p className="mt-1 text-sm text-slate-500">
                                Inicia sesion para continuar a tu espacio legal.
                            </p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-5">
                            {error && (
                                <div className="p-3 text-sm text-red-700 bg-red-50 border border-red-200 rounded-md">
                                    {error}
                                </div>
                            )}

                            <div>
                                <label
                                    htmlFor="username"
                                    className="block text-sm font-medium text-slate-700 mb-1"
                                >
                                    Correo electronico
                                </label>
                                <input
                                    id="username"
                                    type="email"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    required
                                    className="w-full px-3 py-2.5 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-slate-900 sm:text-sm"
                                    placeholder="attorney@firm.com"
                                />
                            </div>

                            <div>
                                <label
                                    htmlFor="password"
                                    className="block text-sm font-medium text-slate-700 mb-1"
                                >
                                    Contraseña
                                </label>
                                <input
                                    id="password"
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    className="w-full px-3 py-2.5 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-slate-900 sm:text-sm"
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-slate-900 hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                {isLoading ? "Iniciando sesion..." : "Iniciar sesion"}
                            </button>
                        </form>

                        <p className="mt-5 text-center text-sm text-slate-500">
                            ¿No tienes cuenta?{" "}
                            <Link
                                href="/signup"
                                className="font-medium text-slate-900 hover:underline"
                            >
                                Crear cuenta
                            </Link>
                        </p>

                        <p className="mt-4 text-xs text-slate-500 leading-relaxed">
                            Al iniciar sesion aceptas nuestros{" "}
                            <Link
                                href="/terminos-y-condiciones"
                                className="font-medium text-slate-700 hover:text-slate-900 underline underline-offset-2"
                            >
                                Terminos y Condiciones
                            </Link>{" "}
                            y la{" "}
                            <Link
                                href="/politica-de-privacidad"
                                className="font-medium text-slate-700 hover:text-slate-900 underline underline-offset-2"
                            >
                                Politica de Privacidad
                            </Link>
                            .
                        </p>

                    </section>
                </div>
            </div>
        </div>
    );
}
