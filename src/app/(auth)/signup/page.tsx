"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { apiClient } from "@/lib/api/client";
import { ArrowRight, MailCheck, UserPlus } from "lucide-react";

type SignupResponse = {
    message: string;
    user_id: string;
    access_token?: string;
    token_type?: string;
};

export default function SignupPage() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (password !== confirmPassword) {
            setError("Las contrasenas no coinciden.");
            return;
        }

        if (password.length < 8) {
            setError("La contrasena debe tener al menos 8 caracteres.");
            return;
        }

        setIsLoading(true);
        try {
            await apiClient.post<SignupResponse>("/signup", {
                email,
                password,
            });

            setIsSuccess(true);

            // Make it explicit, then route to login.
            setTimeout(() => {
                router.push("/login?signup=success");
            }, 2500);
        } catch (err: any) {
            setError(
                err.response?.data?.detail ||
                    err.message ||
                    "No se pudo crear tu cuenta."
            );
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="relative min-h-screen bg-slate-950 text-slate-100 overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(16,185,129,0.16),transparent_38%),radial-gradient(circle_at_80%_10%,rgba(59,130,246,0.14),transparent_34%),radial-gradient(circle_at_60%_85%,rgba(245,158,11,0.1),transparent_34%)]" />
            <div className="relative mx-auto flex min-h-screen w-full max-w-6xl items-center justify-center p-6 md:p-10">
                <div className="w-full max-w-xl overflow-hidden rounded-3xl border border-slate-800/80 bg-white text-slate-900 shadow-2xl">
                    <div className="border-b border-slate-100 bg-slate-50 px-6 py-5">
                        <Link href="/" className="text-sm font-semibold text-slate-500">
                            TemisAI
                        </Link>
                        <h1 className="mt-2 text-2xl font-semibold tracking-tight">
                            Crea tu cuenta
                        </h1>
                        <p className="mt-1 text-sm text-slate-500">
                            Comienza a usar ChatLegal y Experto OCR en minutos.
                        </p>
                    </div>

                    <div className="p-6 sm:p-8">
                        {isSuccess ? (
                            <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-emerald-900">
                                <div className="flex items-start gap-3">
                                    <MailCheck className="mt-0.5 h-5 w-5 text-emerald-600" />
                                    <div>
                                        <p className="text-sm font-semibold">
                                            Cuenta creada correctamente
                                        </p>
                                        <p className="mt-1 text-sm">
                                            Confirma tu correo electronico antes de iniciar
                                            sesion. Redirigiendo al acceso...
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <>
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
                                            placeholder="attorney@firm.com"
                                        />
                                    </div>

                                    <div>
                                        <label
                                            htmlFor="password"
                                            className="block text-sm font-medium text-slate-700 mb-1"
                                        >
                                            Contrasena
                                        </label>
                                        <input
                                            id="password"
                                            type="password"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            required
                                            className="w-full px-3 py-2.5 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-slate-900 sm:text-sm"
                                            placeholder="Minimo 8 caracteres"
                                        />
                                    </div>

                                    <div>
                                        <label
                                            htmlFor="confirm-password"
                                            className="block text-sm font-medium text-slate-700 mb-1"
                                        >
                                            Confirmar contrasena
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
                                        disabled={isLoading}
                                        className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-slate-900 hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                    >
                                        <UserPlus className="h-4 w-4" />
                                        {isLoading ? "Creando cuenta..." : "Crear cuenta"}
                                    </button>
                                </form>

                                <div className="mt-6 rounded-xl border border-slate-200 bg-slate-50 p-4">
                                    <p className="text-sm text-slate-700">
                                        Ya tienes una cuenta?
                                    </p>
                                    <Link
                                        href="/login"
                                        className="mt-2 inline-flex items-center gap-2 text-sm font-medium text-slate-900 hover:text-slate-700"
                                    >
                                        Ir a iniciar sesion
                                        <ArrowRight className="h-4 w-4" />
                                    </Link>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
