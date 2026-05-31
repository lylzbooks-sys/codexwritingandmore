import { Link } from 'react-router-dom';
import { BookOpen, Feather, Palette, Eye, Layers, ArrowRight, Star, Users, Sparkles } from 'lucide-react';
import { Navbar } from '../components/Navbar';

const features = [
  {
    icon: Feather,
    title: 'Writers',
    desc: 'Craft narratives with a distraction-free editor, chapter management, and collaborative writing tools.',
    color: 'text-amber-400',
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/20',
  },
  {
    icon: Eye,
    title: 'Readers',
    desc: 'Discover curated stories, build your reading list, and connect with the authors who move you.',
    color: 'text-sky-400',
    bg: 'bg-sky-500/10',
    border: 'border-sky-500/20',
  },
  {
    icon: Palette,
    title: 'Artists',
    desc: 'Illustrate worlds, design covers, and bring visual life to the stories that deserve it.',
    color: 'text-rose-400',
    bg: 'bg-rose-500/10',
    border: 'border-rose-500/20',
  },
  {
    icon: Layers,
    title: 'Hybrids',
    desc: 'The full creative suite — write, illustrate, read, and collaborate across every medium.',
    color: 'text-emerald-400',
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/20',
  },
];

const stats = [
  { value: '12K+', label: 'Stories Published' },
  { value: '48K+', label: 'Active Creators' },
  { value: '200K+', label: 'Readers Monthly' },
];

export default function Landing() {
  return (
    <div className="min-h-screen bg-stone-950 text-white">
      <Navbar />

      {/* Hero */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-amber-900/20 via-stone-950 to-stone-950" />
        <div
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23d97706' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />

        <div className="relative z-10 max-w-5xl mx-auto px-6 text-center">
          <div className="inline-flex items-center gap-2 bg-amber-500/10 border border-amber-500/30 rounded-full px-4 py-2 mb-8 text-amber-400 text-sm font-medium">
            <Sparkles className="w-4 h-4" />
            Where Stories Live
          </div>

          <h1 className="text-5xl md:text-7xl font-bold leading-tight tracking-tight mb-6">
            Every Story
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-amber-600">
              Deserves a World
            </span>
          </h1>

          <p className="text-stone-400 text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
            Codex is a dark, elegant platform for writers, readers, and artists to create, discover, and inhabit the stories that matter.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/signup"
              className="group flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold px-8 py-4 rounded text-sm tracking-wide transition-all duration-200 hover:shadow-lg hover:shadow-amber-500/25"
            >
              Begin Your Story
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              to="/login"
              className="flex items-center gap-2 border border-stone-700 hover:border-stone-500 text-stone-300 hover:text-white px-8 py-4 rounded text-sm tracking-wide transition-all duration-200"
            >
              Sign In
            </Link>
          </div>
        </div>

        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <div className="w-px h-12 bg-gradient-to-b from-amber-500/60 to-transparent mx-auto" />
        </div>
      </section>

      {/* Stats */}
      <section className="border-y border-stone-800 bg-stone-900/40">
        <div className="max-w-5xl mx-auto px-6 py-12 grid grid-cols-3 gap-8">
          {stats.map((s) => (
            <div key={s.label} className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-amber-400 mb-1">{s.value}</div>
              <div className="text-stone-500 text-sm tracking-wide">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Roles */}
      <section className="max-w-7xl mx-auto px-6 py-24">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Choose Your Role</h2>
          <p className="text-stone-400 max-w-xl mx-auto">
            Codex shapes itself around how you create. Every role unlocks a different view of the world.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((f) => (
            <div
              key={f.title}
              className={`${f.bg} ${f.border} border rounded-xl p-6 hover:scale-105 transition-all duration-300 group cursor-default`}
            >
              <div className={`w-12 h-12 ${f.bg} ${f.border} border rounded-lg flex items-center justify-center mb-4`}>
                <f.icon className={`w-6 h-6 ${f.color}`} />
              </div>
              <h3 className="text-lg font-semibold mb-2">{f.title}</h3>
              <p className="text-stone-400 text-sm leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-amber-900/30 via-stone-900 to-stone-900" />
        <div className="relative max-w-4xl mx-auto px-6 py-24 text-center">
          <BookOpen className="w-12 h-12 text-amber-500 mx-auto mb-6" />
          <h2 className="text-3xl md:text-5xl font-bold mb-6">
            Your Story Starts Here
          </h2>
          <p className="text-stone-400 mb-10 text-lg">
            Join thousands of creators already building their worlds on Codex.
          </p>
          <Link
            to="/signup"
            className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold px-10 py-4 rounded text-sm tracking-wide transition-all duration-200"
          >
            <Users className="w-4 h-4" />
            Create Free Account
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-stone-800 py-8">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-amber-500" />
            <span className="text-stone-400 text-sm font-semibold tracking-widest">CODEX</span>
          </div>
          <p className="text-stone-600 text-sm">© 2026 Codex. All rights reserved.</p>
          <div className="flex items-center gap-2 text-stone-600 text-sm">
            <Star className="w-3 h-3 text-amber-500/60" />
            <span>Stories worth telling</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
