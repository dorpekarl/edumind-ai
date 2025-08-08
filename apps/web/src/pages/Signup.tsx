import { useState } from 'react';
import { supabase } from '../supabaseClient';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';

export default function Signup() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signUp({ email, password });
    setLoading(false);
    if (error) return alert(error.message);
    alert('Check your email to confirm your account');
    navigate('/');
  }

  async function oauth(provider: 'google'|'github'|'apple') {
    const { error } = await supabase.auth.signInWithOAuth({ provider, options: { redirectTo: window.location.origin } });
    if (error) alert(error.message);
  }

  return (
    <div className="min-h-[70vh] rounded-xl bg-gradient-hero p-10 flex items-center justify-center">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="w-full max-w-md bg-white/80 dark:bg-gray-950/80 backdrop-blur rounded-xl p-6">
        <h1 className="text-2xl font-bold mb-2">Create account</h1>
        <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">Start learning with EduMind AI</p>
        <form onSubmit={onSubmit} className="grid gap-3">
          <input type="email" placeholder="Email" value={email} onChange={(e)=>setEmail(e.target.value)} className="border rounded-md px-3 py-2 bg-white dark:bg-gray-900" required />
          <input type="password" placeholder="Password" value={password} onChange={(e)=>setPassword(e.target.value)} className="border rounded-md px-3 py-2 bg-white dark:bg-gray-900" required />
          <button disabled={loading} className="px-3 py-2 bg-primary text-white rounded-md">{loading? 'Signing up…':'Sign up'}</button>
        </form>
        <div className="my-4 text-center text-sm text-gray-500">or sign up with</div>
        <div className="grid grid-cols-3 gap-2">
          <button onClick={()=>oauth('google')} className="border rounded-md py-2">Google</button>
          <button onClick={()=>oauth('github')} className="border rounded-md py-2">GitHub</button>
          <button onClick={()=>oauth('apple')} className="border rounded-md py-2">Apple</button>
        </div>
        <div className="text-sm mt-4">Already have an account? <Link to="/login" className="text-primary">Log in</Link></div>
      </motion.div>
    </div>
  );
}