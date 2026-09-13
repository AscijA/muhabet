# Muhabet

Muhabet is a real-time, private one-to-one messaging application built with React, TypeScript, Redux Toolkit, and Firebase.

## Requirements

- Node.js 20+
- npm 10+
- A Firebase project with Authentication, Firestore, and Storage enabled

## Local setup

1. Copy `.env.example` to `.env`.
2. Fill in the Firebase web application configuration.
3. Run `npm install`.
4. Run `npm start` and open the Vite URL shown in the terminal (normally `http://localhost:5173`).

The Firebase API key is a public client identifier, but `.env` remains ignored to prevent accidental disclosure of project-specific configuration.

## Quality commands

- `npm run typecheck` — validate TypeScript.
- `npm run lint` — run static analysis.
- `npm run test:unit` — run domain and application tests with Vitest.
- `npm run test:rules` — verify Firestore access with the local emulator.
- `npm run test:e2e` — run deterministic browser journeys.
- `npm run test:e2e:ui` — open the Playwright test runner.
- `npm run build` — create a production bundle.
- `npm run check` — run the complete verification sequence.

E2E tests start the application with an in-memory backend. They never read or modify production Firebase data.

## Firebase

`firebase.json`, `firestore.rules`, `firestore.indexes.json`, and `storage.rules` define the deployed data boundary. Deploy them only after selecting the intended Firebase project.

The current data model uses `/chats/{conversationId}/messages/{messageId}` for messages and stores participant IDs on the parent chat document.

User discovery and account deletion run through callable Firebase Functions; browser clients have no Firestore access to `/user-directory`. The Functions module creates a server-owned SHA-256 email index, requires recent authentication for deletion, removes profile and account data, and anonymizes retained conversation membership.

Before deploying Functions, add a Firebase App Check reCAPTCHA Enterprise site key as `VITE_APP_CHECK_SITE_KEY`, install their dependencies with `npm --prefix functions install`, then deploy the selected Firebase project with `npm --prefix functions run deploy`. Callable operations require Firebase Authentication and valid App Check attestation; account deletion also consumes its App Check token to resist replay.

## Repository security

The local `.env` file is ignored and must never be committed. If you cloned before the 2026-09-13 history rewrite, create a fresh clone or reset your local branch to the rewritten `origin/main` before pushing; old commit IDs must not be merged back.

