import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

export const PASSWORD_RULES = [
    { id: "length",  label: "Mínimo 8 caracteres",        test: (p: string) => p.length >= 8 },
    { id: "upper",   label: "Al menos una letra mayúscula", test: (p: string) => /[A-Z]/.test(p) },
    { id: "number",  label: "Al menos un número",          test: (p: string) => /[0-9]/.test(p) },
    { id: "special", label: "Al menos un carácter especial (!@#$%^&*…)", test: (p: string) => /[^A-Za-z0-9]/.test(p) },
] as const

export function validatePassword(password: string): boolean {
    return PASSWORD_RULES.every((r) => r.test(password))
}
