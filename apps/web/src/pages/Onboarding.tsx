import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { motion } from 'framer-motion';
import { supabase } from '../supabaseClient';
import { ThemeToggle } from '@edumind/shared/src/components/ThemeToggle';

export default function Onboarding() {
  return (
    <div className="min-h-[70vh] rounded-xl bg-gradient-hero p-10 flex items-center justify-center">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="max-w-lg w-full bg-white/80 dark:bg-gray-950/80 backdrop-blur rounded-xl p-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-extrabold">Welcome to EduMind AI</h1>
          <ThemeToggle />
        </div>
        <p className="text-gray-600 dark:text-gray-300 mt-2 mb-6">Study smarter with AI-powered chat, flashcards, analytics, and more.</p>
        <Auth supabaseClient={supabase} providers={['google','github','apple']} appearance={{ theme: ThemeSupa }} />
      </motion.div>
    </div>
  );
}