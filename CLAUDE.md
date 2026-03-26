# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # Start development server (Next.js with Turbopack)
npm run build    # Production build (standalone output)
npm run start    # Start production server
npm run lint     # Run ESLint
```

No test runner is configured.

## Architecture Overview

**TemisAI** is a legal AI assistant platform for Colombian legal professionals, built with Next.js App Router.

### Two Core Modes

1. **ChatLegal** — General legal research that searches Colombian legal codes without document attachment
2. **Experto OCR** — Document-specific analysis that cites chunks from uploaded PDFs alongside legal references

### Route Groups

- `(auth)/` — Unauthenticated pages: `/login`, `/signup`, `/solicitar-acceso`
- `(dashboard)/` — Protected routes with sidebar layout: `/documents`, `/threads/[id]`, `/derecho-peticion`
- Top-level: `/terminos-y-condiciones`, `/politica-de-privacidad`; root `/` redirects to `/login`

### Authentication

JWT stored in `localStorage`. `AuthContext` (`src/context/AuthContext.tsx`) decodes the token with `jwt-decode`, exposes `{ token, user, isAuthenticated, login, logout }`, and clears state on logout. The dashboard layout (`(dashboard)/layout.tsx`) is a client component that guards all protected routes client-side — there is no Next.js middleware.

### API Client

`src/lib/api/client.ts` — Axios instance targeting `NEXT_PUBLIC_API_URL` (default `http://localhost:8000`). A request interceptor injects `Authorization: Bearer <token>` from localStorage; a response interceptor clears the token and redirects to `/login` on 401. Backend uses OAuth2 password flow (`POST /token`).

### Server State

React Query v5 (`@tanstack/react-query`) manages all server state. Provider is in `src/app/providers.tsx` (staleTime: 60s, retry: 1, no refetch-on-focus). Key query patterns: threads list, messages per thread, documents, code-documents.

### Key Patterns

- **PDF viewer**: `src/components/PdfViewer.tsx` loaded via `next/dynamic` with `ssr: false` (required — avoids canvas issues). Supports chunk highlighting by page/bounding-box coordinates.
- **Styling**: Tailwind CSS v4 utility classes; `cn()` helper in `src/lib/utils.ts` merges classes via `clsx` + `tailwind-merge`.
- **Types**: All API response shapes defined in `src/lib/types/api.ts`.
- **Environment variable**: Only `NEXT_PUBLIC_API_URL` is used.
