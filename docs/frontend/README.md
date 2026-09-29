# Frontend Documentation

## 1. Overview
The web application is built with **Next.js 16 (App Router)**, **React 19**, and **TypeScript 5**, designed to deliver a modern, high-performance, RTL-first experience for Saudi and Gulf educational markets.

- **Location**: `apps/web/`
- **Framework**: Next.js 16.3.7
- **UI Runtime**: React 19.2.8
- **Language**: TypeScript 5 (Strict Mode)
- **Styling**: Tailwind CSS v4 + PostCSS
- **Linting**: ESLint 9 (`eslint-config-next`)

---

## 2. Directory Structure

```text
apps/web/
├── public/                     # Static assets (fonts, icons, images)
├── src/
│   ├── app/                    # Next.js App Router (pages, layouts, routes)
│   │   ├── favicon.ico
│   │   ├── globals.css         # Global CSS with Tailwind v4 imports
│   │   ├── layout.tsx          # Root layout (RTL-ready, IBM Plex Sans Arabic)
│   │   └── page.tsx            # Landing/welcome page
│   └── lib/                    # Shared libraries and utilities
│       └── api-client.ts       # Typed API client with envelope handling & correlation
├── .env.example                # Frontend environment template
├── eslint.config.mjs           # ESLint configuration
├── next.config.ts              # Next.js configuration
├── package.json                # Project dependencies and scripts
├── postcss.config.mjs          # PostCSS configuration
└── tsconfig.json               # TypeScript strict configuration
```

---

## 3. API Client & Contract Integration (M1)

The frontend communicates with `/api/v1` via `src/lib/api-client.ts`:
- Automatically attaches and receives `X-Request-ID` for end-to-end tracing.
- Unwraps the standard `{ data, meta }` response envelope.
- Throws strongly-typed `ApiError` instances containing `code`, `status`, `message`, `details`, and `requestId`.
- Supports method helpers: `apiClient.get<T>()`, `apiClient.post<T>()`, etc.

---

## 4. Verification & Development Commands

From `apps/web/`:

```bash
# Start development server
npm run dev

# Run type check
npx tsc --noEmit

# Run ESLint
npm run lint

# Build production bundle
npm run build
```

---

## 5. UI/UX Principles
- **RTL-First**: Default text direction is right-to-left (`dir="rtl"`) for Arabic interfaces.
- **Typography**: IBM Plex Sans Arabic as primary typeface.
- **Theming**: Light and Dark mode support with curated accessible palettes.
- **Security**: Frontend authentication checks are UI state helpers only; security boundaries are strictly enforced on the backend.
