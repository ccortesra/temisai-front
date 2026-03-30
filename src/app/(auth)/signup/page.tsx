"use client";

import { useState } from "react";
import { apiClient } from "@/lib/api/client";
import { PASSWORD_RULES, validatePassword } from "@/lib/utils";
import Link from "next/link";
import { ShieldCheck, Scale, Sparkles, CheckCircle2, Circle, MailCheck } from "lucide-react";
import type { SignUpResponse } from "@/lib/types/api";

export default function SignupPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    const passwordValid = validatePassword(password);
    const passwordsMatch = password === confirmPassword && confirmPassword.length > 0;
    const canSubmit = passwordValid && passwordsMatch && email.length > 0;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!canSubmit) return;
        setError(null);
        setIsLoading(true);

        try {
            await apiClient.post<SignUpResponse>("/signup", {
                email: email.trim(),
                password,
            });
            setSuccess(true);
        } catch (err: any) {
            const detail = err.response?.data?.detail;
            setError(
                (typeof detail === "string" && detail) ||
                detail?.[0]?.msg ||
                err.message ||
                "No se pudo crear la cuenta. Intenta de nuevo."
            );
        } finally {
            setIsLoading(false);
        }
    };

    if (success) {
        return (
            <div className="relative min-h-screen bg-slate-950 text-slate-100 overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(16,185,129,0.16),transparent_38%),radial-gradient(circle_at_80%_10%,rgba(59,130,246,0.14),transparent_34%),radial-gradient(circle_at_60%_85%,rgba(245,158,11,0.1),transparent_34%)]" />
                <div className="relative mx-auto flex min-h-screen w-full max-w-lg items-center justify-center p-6">
                    <div className="w-full rounded-3xl border border-slate-800/80 bg-slate-900/80 shadow-2xl backdrop-blur p-8 sm:p-10 text-center">
                        <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/10 ring-1 ring-emerald-500/30">
                            <MailCheck className="h-7 w-7 text-emerald-400" />
                        </div>
                        <h2 className="text-2xl font-semibold tracking-tight text-white">
                            Revisa tu correo
                        </h2>
                        <p className="mt-3 text-sm text-slate-300 leading-relaxed max-w-sm mx-auto">
                            Te hemos enviado un enlace de confirmacion a{" "}
                            <span className="font-medium text-white">{email}</span>.
                            Abre el enlace para activar tu cuenta.
                        </p>
                        <Link
                            href="/login"
                            className="mt-7 inline-flex items-center justify-center rounded-md bg-white px-5 py-2.5 text-sm font-medium text-slate-900 shadow hover:bg-slate-100 transition-colors"
                        >
                            Ir a iniciar sesion
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="relative min-h-screen bg-slate-950 text-slate-100 overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(16,185,129,0.16),transparent_38%),radial-gradient(circle_at_80%_10%,rgba(59,130,246,0.14),transparent_34%),radial-gradient(circle_at_60%_85%,rgba(245,158,11,0.1),transparent_34%)]" />
            <div className="relative mx-auto flex min-h-screen w-full max-w-6xl items-center justify-center p-6 md:p-10">
                <div className="grid w-full overflow-hidden rounded-3xl border border-slate-800/80 bg-slate-900/80 shadow-2xl backdrop-blur md:grid-cols-2">
                    <section className="hidden md:flex flex-col justify-between p-10 bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800 border-r border-slate-800">
                        <div>
                            <h1 className="text-3xl font-semibold tracking-tight text-white">
                                Unete a TemisAI
                            </h1>
                            <p className="mt-3 text-sm text-slate-300 leading-relaxed">
                                Tu espacio legal inteligente. Investiga, analiza documentos y
                                genera escritos con la ayuda de IA especializada en derecho colombiano.
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
                                Crear cuenta
                            </h2>
                            <p className="mt-1 text-sm text-slate-500">
                                Completa los datos para registrarte en TemisAI.
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
                                    className="w-full px-3 py-2.5 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-slate-900 sm:text-sm"
                                    placeholder="tu@correo.com"
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

                                {password.length > 0 && (
                                    <ul className="mt-2.5 space-y-1">
                                        {PASSWORD_RULES.map((rule) => {
                                            const pass = rule.test(password);
                                            return (
                                                <li
                                                    key={rule.id}
                                                    className={`flex items-center gap-1.5 text-xs ${pass ? "text-emerald-600" : "text-slate-400"}`}
                                                >
                                                    {pass ? (
                                                        <CheckCircle2 className="h-3.5 w-3.5" />
                                                    ) : (
                                                        <Circle className="h-3.5 w-3.5" />
                                                    )}
                                                    {rule.label}
                                                </li>
                                            );
                                        })}
                                    </ul>
                                )}
                            </div>

                            <div>
                                <label
                                    htmlFor="confirm-password"
                                    className="block text-sm font-medium text-slate-700 mb-1"
                                >
                                    Confirmar contraseña
                                </label>
                                <input
                                    id="confirm-password"
                                    type="password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    required
                                    className="w-full px-3 py-2.5 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-slate-900 sm:text-sm"
                                />
                                {confirmPassword.length > 0 && !passwordsMatch && (
                                    <p className="mt-1.5 text-xs text-red-500">
                                        Las contraseñas no coinciden.
                                    </p>
                                )}
                            </div>

                            <button
                                type="submit"
                                disabled={isLoading || !canSubmit}
                                className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-slate-900 hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                {isLoading ? "Creando cuenta..." : "Crear cuenta"}
                            </button>
                        </form>

                        <p className="mt-5 text-center text-sm text-slate-500">
                            ¿Ya tienes cuenta?{" "}
                            <Link
                                href="/login"
                                className="font-medium text-slate-900 hover:underline"
                            >
                                Iniciar sesion
                            </Link>
                        </p>

                        <p className="mt-4 text-xs text-slate-500 leading-relaxed">
                            Al crear tu cuenta aceptas nuestros{" "}
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
