"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { apiClient } from "@/lib/api/client";
import { PASSWORD_RULES, validatePassword } from "@/lib/utils";
import { SetPasswordResponse } from "@/lib/types/api";
import { CheckCircle2, XCircle, AlertCircle } from "lucide-react";

export default function SetPasswordPage() {
    const { login } = useAuth();
    const [accessToken, setAccessToken] = useState("");
    const [refreshToken, setRefreshToken] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [passwordTouched, setPasswordTouched] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ""));
        const searchParams = new URLSearchParams(window.location.search);

        const extractedAccessToken =
            hashParams.get("access_token") || searchParams.get("access_token") || "";
        const extractedRefreshToken =
            hashParams.get("refresh_token") || searchParams.get("refresh_token") || "";

        setAccessToken(extractedAccessToken);
        setRefreshToken(extractedRefreshToken);

        if (!extractedAccessToken || !extractedRefreshToken) {
            setError(
                "El enlace de invitacion es invalido o ha expirado. Solicita un nuevo enlace."
            );
        }
    }, []);

    const canSubmit = useMemo(
        () => !!accessToken && !!refreshToken && !isLoading,
        [accessToken, refreshToken, isLoading]
    );

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (!accessToken || !refreshToken) {
            setError(
                "No encontramos los tokens de invitacion. Abre el enlace original nuevamente."
            );
            return;
        }

        if (!validatePassword(password)) {
            setPasswordTouched(true);
            setError("La contraseña no cumple los requisitos de seguridad.");
            return;
        }

        if (password !== confirmPassword) {
            setError("Las contraseñas no coinciden.");
            return;
        }

        setIsLoading(true);
        try {
            const res = await apiClient.post<SetPasswordResponse>("/set-password", {
                access_token: accessToken,
                refresh_token: refreshToken,
                password,
            });

            const token = res.data.access_token;
            if (!token) {
                throw new Error("No se recibio token de sesion.");
            }

            login(token);
        } catch (err: any) {
            setError(
                err.response?.data?.detail ||
                    err.response?.data?.detail?.[0]?.msg ||
                    err.message ||
                    "No se pudo establecer la contraseña. El enlace puede haber expirado."
            );
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="relative min-h-screen bg-slate-950 text-slate-100 overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(16,185,129,0.16),transparent_38%),radial-gradient(circle_at_80%_10%,rgba(59,130,246,0.14),transparent_34%),radial-gradient(circle_at_60%_85%,rgba(245,158,11,0.1),transparent_34%)]" />

            <div className="relative mx-auto flex min-h-screen w-full max-w-3xl items-center justify-center p-6 md:p-10">
                <section className="w-full rounded-3xl border border-slate-800/80 bg-white p-6 sm:p-8 md:p-10 text-slate-900 shadow-2xl">
                    <div className="mb-7">
                        <Link href="/login" className="text-sm font-semibold text-slate-500">
                            Volver a inicio de sesion
                        </Link>
                        <h1 className="mt-2 text-2xl font-semibold tracking-tight">
                            Define tu contraseña
                        </h1>
                        <p className="mt-1 text-sm text-slate-500">
                            Establece una contraseña segura para activar tu cuenta por
                            invitacion.
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        {error && (
                            <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700 flex items-start gap-2">
                                <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                                <span>{error}</span>
                            </div>
                        )}

                        <div>
                            <label
                                htmlFor="password"
                                className="block text-sm font-medium text-slate-700 mb-1"
                            >
                                Nueva contraseña
                            </label>
                            <input
                                id="password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                onBlur={() => setPasswordTouched(true)}
                                required
                                className="w-full px-3 py-2.5 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-slate-900 sm:text-sm"
                            />
                            {passwordTouched && password.length > 0 && (
                                <ul className="mt-2 space-y-1">
                                    {PASSWORD_RULES.map((rule) => {
                                        const ok = rule.test(password);
                                        return (
                                            <li
                                                key={rule.id}
                                                className="flex items-center gap-1.5 text-xs"
                                            >
                                                {ok ? (
                                                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                                                ) : (
                                                    <XCircle className="h-3.5 w-3.5 text-red-400" />
                                                )}
                                                <span
                                                    className={
                                                        ok
                                                            ? "text-emerald-700"
                                                            : "text-red-500"
                                                    }
                                                >
                                                    {rule.label}
                                                </span>
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
                        </div>

                        <button
                            type="submit"
                            disabled={!canSubmit}
                            className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-slate-900 hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            {isLoading ? "Guardando contraseña..." : "Guardar contraseña"}
                        </button>
                    </form>
                </section>
            </div>
        </div>
    );
}
