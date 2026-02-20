"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { jwtDecode } from "jwt-decode";

interface AuthContextType {
    token: string | null;
    user: any | null;
    isAuthenticated: boolean;
    login: (token: string) => void;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [token, setToken] = useState<string | null>(null);
    const [user, setUser] = useState<any | null>(null);
    const [isInitialized, setIsInitialized] = useState(false);
    const router = useRouter();

    useEffect(() => {
        // Initialize from localStorage on mount
        const storedToken = localStorage.getItem("token");
        if (storedToken) {
            try {
                const decoded = jwtDecode(storedToken);
                // Basic check if token is expired
                if (decoded.exp && decoded.exp * 1000 < Date.now()) {
                    console.warn("Token expired");
                    localStorage.removeItem("token");
                } else {
                    setToken(storedToken);
                    setUser(decoded);
                }
            } catch (e) {
                console.error("Invalid token", e);
                localStorage.removeItem("token");
            }
        }
        setIsInitialized(true);
    }, []);

    const login = (newToken: string) => {
        localStorage.setItem("token", newToken);
        setToken(newToken);
        try {
            setUser(jwtDecode(newToken));
        } catch (e) {
            console.error("Failed to decode token on login", e);
        }
        router.push("/documents");
    };

    const logout = () => {
        localStorage.removeItem("token");
        setToken(null);
        setUser(null);
        router.push("/login");
    };

    // Prevent flashing protected content before auth is checked
    if (!isInitialized) {
        return null; // Or a subtle loading state
    }

    return (
        <AuthContext.Provider value={{ token, user, isAuthenticated: !!token, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
}
