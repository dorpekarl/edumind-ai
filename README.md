# EduMind AI – AI-Powered Study Assistant

Monorepo (Turborepo) with Web (React + Vite + Tailwind), Mobile (React Native CLI), Supabase (DB, Auth, Realtime, Edge Functions), and shared packages.

## Prerequisites
- Node 18+
- Java 17+, Android SDK (for Android)
- Xcode 15+ (for iOS)
- Supabase project

## Quick start
1. Copy `.env.example` to `.env` and fill values.
2. Install deps: `npm i`
3. Start all apps: `npm run dev`
   - Web: http://localhost:5173
   - Mobile: open `apps/mobile` in Android Studio/Xcode after installing pods

## Web (apps/web)
- Dev: `npm run dev -w apps/web`
- Build: `npm run build -w apps/web`
- Preview: `npm run preview -w apps/web`

## Mobile (apps/mobile)
- Install pods: `cd apps/mobile && npm i && cd ios && pod install && cd ../..`
- Android: `npm run android -w apps/mobile`
- iOS: `npm run ios -w apps/mobile`

## Supabase
- Apply SQL: open Supabase SQL editor and paste `supabase/migrations/0001_schema.sql`
- Deploy functions:
  - `supabase functions deploy ai-chat`
  - `supabase functions deploy flashcard-gen`
  - `supabase functions deploy paystack-webhook`

## Deployment
- Web (Vercel): set env vars, build command `npm run build -w apps/web`, output `apps/web/dist`
- Android (Play Store): create release build via Gradle, sign, upload
- iOS (App Store): archive in Xcode, upload via Transporter

See each app's README for details.