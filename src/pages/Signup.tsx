import { useState, FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BookOpen, Mail, Lock, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Signup() {
  const { signUp } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    if (password !== confirm) {
      setError('Passwords do not match.');
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    setLoading(true);
    const { error } = await signUp(email, password);
    setLoading(false);
    if (error) {
      setError(error.message);
      return;
    }
    navigate('/onboarding');
  };

  return (
    <div className="min-h-screen bg-stone-950 flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-amber-900/15 via-stone-950 to-stone-950" />

      <div className="relative w-full max-w-md">
        <div className="text-center mb-10">
          <Link to="/" className="inline-flex items-center gap-2 mb-8 group">
            <BookOpen className="w-7 h-7 text-amber-500 group-hover:text-amber-400 transition-colors" />
            <span className="text-2xl font-bold tracking-widest text-white">CODEX</span>
          </Link>
          <h1 className="text-2xl font-bold text-white mb-2">Create your account</h1>
          <p className="text-stone-500 text-sm">Your story begins with a single step</p>
        </div>

        <div className="bg-stone-900 border border-stone-800 rounded-xl p-8">
          {error && (
            <div className="flex items-center gap-3 bg-red-900/30 border border-red-800/50 rounded-lg px-4 py-3 mb-6 text-red-400 text-sm">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-stone-400 text-xs font-medium tracking-wider uppercase mb-2">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-500" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="your@email.com"
                  className="w-full bg-stone-800 border border-stone-700 focus:border-amber-500 rounded-lg pl-10 pr-4 py-3 text-white placeholder-stone-600 text-sm outline-none transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-stone-400 text-xs font-medium tracking-wider uppercase mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-500" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="w-full bg-stone-800 border border-stone-700 focus:border-amber-500 rounded-lg pl-10 pr-4 py-3 text-white placeholder-stone-600 text-sm outline-none transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-stone-400 text-xs font-medium tracking-wider uppercase mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-500" />
                <input
                  type="password"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="w-full bg-stone-800 border border-stone-700 focus:border-amber-500 rounded-lg pl-10 pr-4 py-3 text-white placeholder-stone-600 text-sm outline-none transition-colors"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-amber-500 hover:bg-amber-400 disabled:opacity-50 disabled:cursor-not-allowed text-stone-950 font-bold py-3 rounded-lg text-sm tracking-wide transition-all duration-200 hover:shadow-lg hover:shadow-amber-500/20"
            >
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>
        </div>

        <p className="text-center text-stone-500 text-sm mt-6">
          Already have an account?{' '}
          <Link to="/login" className="text-amber-400 hover:text-amber-300 transition-colors">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
