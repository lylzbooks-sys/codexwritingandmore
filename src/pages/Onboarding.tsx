import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Feather, Eye, Palette, Layers, ArrowRight } from 'lucide-react';
import { supabase, UserRole } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';

const roles: {
  key: UserRole;
  label: string;
  tagline: string;
  desc: string;
  icon: React.ElementType;
  color: string;
  bg: string;
  border: string;
  activeBorder: string;
  activeBg: string;
}[] = [
  {
    key: 'writer',
    label: 'Writer',
    tagline: 'The Architect of Words',
    desc: 'You craft worlds with sentences, shape characters with dialogue, and leave readers breathless at chapter ends.',
    icon: Feather,
    color: 'text-amber-400',
    bg: 'bg-amber-500/10',
    border: 'border-stone-700',
    activeBorder: 'border-amber-500',
    activeBg: 'bg-amber-500/10',
  },
  {
    key: 'reader',
    label: 'Reader',
    tagline: 'The Seeker of Worlds',
    desc: 'You lose yourself in stories, champion the authors you love, and always have three books on your nightstand.',
    icon: Eye,
    color: 'text-sky-400',
    bg: 'bg-sky-500/10',
    border: 'border-stone-700',
    activeBorder: 'border-sky-500',
    activeBg: 'bg-sky-500/10',
  },
  {
    key: 'artist',
    label: 'Artist',
    tagline: 'The Painter of Visions',
    desc: 'You visualize the unseen — cover art, character portraits, map illustrations — the images a thousand words deserve.',
    icon: Palette,
    color: 'text-rose-400',
    bg: 'bg-rose-500/10',
    border: 'border-stone-700',
    activeBorder: 'border-rose-500',
    activeBg: 'bg-rose-500/10',
  },
  {
    key: 'hybrid',
    label: 'Hybrid',
    tagline: 'The Complete Creator',
    desc: "You don't fit one box. You write, illustrate, read voraciously, and cross every boundary between disciplines.",
    icon: Layers,
    color: 'text-emerald-400',
    bg: 'bg-emerald-500/10',
    border: 'border-stone-700',
    activeBorder: 'border-emerald-500',
    activeBg: 'bg-emerald-500/10',
  },
];

export default function Onboarding() {
  const { user, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const [selected, setSelected] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleContinue = async () => {
    if (!selected || !user) return;
    setLoading(true);
    setError('');

    const { error } = await supabase
      .from('profiles')
      .upsert({
        id: user.id,
        role: selected,
        onboarding_complete: true,
      });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    await refreshProfile();
    navigate(`/dashboard/${selected}`);
  };

  return (
    <div className="min-h-screen bg-stone-950 flex flex-col items-center justify-center px-4 py-12">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-stone-900/80 via-stone-950 to-stone-950" />

      <div className="relative w-full max-w-3xl">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-2 mb-6">
            <BookOpen className="w-7 h-7 text-amber-500" />
            <span className="text-2xl font-bold tracking-widest text-white">CODEX</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">
            Who are you in the story?
          </h1>
          <p className="text-stone-400 text-base max-w-lg mx-auto">
            Your role shapes your experience on Codex. You can always change it later.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-4 mb-8">
          {roles.map((role) => {
            const isActive = selected === role.key;
            return (
              <button
                key={role.key}
                onClick={() => setSelected(role.key)}
                className={`text-left rounded-xl border p-6 transition-all duration-200 hover:scale-[1.02] cursor-pointer group ${
                  isActive
                    ? `${role.activeBorder} ${role.activeBg}`
                    : `${role.border} bg-stone-900/50 hover:border-stone-600`
                }`}
              >
                <div className={`w-12 h-12 rounded-lg ${role.bg} flex items-center justify-center mb-4 transition-transform group-hover:scale-110`}>
                  <role.icon className={`w-6 h-6 ${role.color}`} />
                </div>
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-white font-bold text-lg">{role.label}</h3>
                  {isActive && (
                    <span className={`text-xs font-semibold ${role.color} bg-stone-800 px-2 py-0.5 rounded-full`}>
                      Selected
                    </span>
                  )}
                </div>
                <p className={`text-xs font-medium tracking-wide mb-2 ${role.color}`}>{role.tagline}</p>
                <p className="text-stone-400 text-sm leading-relaxed">{role.desc}</p>
              </button>
            );
          })}
        </div>

        {error && (
          <p className="text-red-400 text-sm text-center mb-4">{error}</p>
        )}

        <div className="flex justify-center">
          <button
            onClick={handleContinue}
            disabled={!selected || loading}
            className="group flex items-center gap-2 bg-amber-500 hover:bg-amber-400 disabled:opacity-40 disabled:cursor-not-allowed text-stone-950 font-bold px-10 py-4 rounded-lg text-sm tracking-wide transition-all duration-200 hover:shadow-lg hover:shadow-amber-500/25"
          >
            {loading ? 'Setting up your world...' : 'Enter Codex'}
            {!loading && <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />}
          </button>
        </div>
      </div>
    </div>
  );
}
