"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { apiClient } from "@/lib/api/client";

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
                throw new Error("No token received");
            }
        } catch (err: any) {
            setError(
                err.response?.data?.detail || err.message || "Invalid credentials."
            );
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-slate-100">
            <div className="w-full max-w-md bg-white rounded-xl shadow-lg border border-slate-200 p-8">
                <div className="mb-8 text-center">
                    <h1 className="text-2xl font-semibold text-slate-900 tracking-tight">
                        TemisAI <span className="font-light text-slate-500">Legal</span>
                    </h1>
                    <p className="text-sm text-slate-500 mt-2">
                        Sign in to access your legal workspace.
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
                            Email / Username
                        </label>
                        <input
                            id="username"
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                            className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-slate-900 sm:text-sm"
                            placeholder="attorney@firm.com"
                        />
                    </div>

                    <div>
                        <label
                            htmlFor="password"
                            className="block text-sm font-medium text-slate-700 mb-1"
                        >
                            Password
                        </label>
                        <input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-slate-900 sm:text-sm"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-slate-900 hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        {isLoading ? "Signing in..." : "Sign In"}
                    </button>
                </form>
            </div>
        </div>
    );
}
