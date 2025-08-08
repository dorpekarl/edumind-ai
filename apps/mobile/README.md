# EduMind Mobile

React Native CLI app (Android/iOS) for EduMind AI.

## Setup
- Node 18+, Java 17+, Android Studio (SDK/NDK), Xcode 15+
- From repo root: `npm i`
- Mobile deps: `cd apps/mobile && npm i`
- iOS pods: `cd ios && pod install && cd ..`

## Run
- Android: `npm run android -w apps/mobile`
- iOS: `npm run ios -w apps/mobile`

## Native modules
- TTS: `react-native-tts`
- Document picker: `react-native-document-picker`

## Auth
Use `@supabase/supabase-js` with deep links for OAuth if needed. Configure redirect URL in Supabase.
