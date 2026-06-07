import { NavLink, useNavigate, Link } from 'react-router-dom';
import {
  Layers, BookOpen, LogOut, PenLine, Image,
  Eye, BookMarked, BarChart2, Settings, Sparkles, Users, Home, LayoutGrid
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const stats = [
  { label: 'Stories', value: '0', icon: BookMarked, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
  { label: 'Artworks', value: '0', icon: Image, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
  { label: 'Books Read', value: '0', icon: Eye, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
  { label: 'Collaborators', value: '0', icon: Users, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
];

const navItems = [
  { icon: Home, label: 'Home', to: '/' },
  { icon: PenLine, label: 'Write', to: '/dashboard/writer' },
  { icon: Image, label: 'Create Art', to: '/dashboard/artist' },
  { icon: BookMarked, label: 'Reading List', to: '/dashboard/reader' },
  { icon: LayoutGrid, label: 'Storyboard', to: '/storyboard' },
  { icon: Settings, label: 'Settings', to: '#' },
];

const quickActions = [
  { label: 'New Story', icon: PenLine, color: 'bg-amber-500 hover:bg-amber-400 text-stone-950' },
  { label: 'Upload Art', icon: Image, color: 'bg-rose-600 hover:bg-rose-500 text-white' },
  { label: 'Find Stories', icon: Eye, color: 'bg-sky-600 hover:bg-sky-500 text-white' },
  { label: 'Collaborate', icon: Users, color: 'bg-emerald-600 hover:bg-emerald-500 text-white' },
];

export default function HybridDashboard() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-stone-950 text-white flex">
      <aside className="hidden md:flex fixed left-0 top-0 h-full w-64 bg-stone-900 border-r border-stone-800 flex-col z-40">
        <div className="p-6 border-b border-stone-800">
          <Link to="/" className="flex items-center gap-2 mb-4 hover:opacity-80 transition-opacity">
            <BookOpen className="w-5 h-5 text-amber-500" />
            <span className="font-bold tracking-widest text-sm">CODEX</span>
          </Link>
          <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/30 rounded-full px-3 py-1">
            <Layers className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-xs font-semibold text-emerald-400 tracking-wide">HYBRID</span>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors text-left ${
                  isActive && item.to !== '#'
                    ? 'bg-emerald-500/10 text-emerald-400'
                    : 'text-stone-400 hover:text-white hover:bg-stone-800'
                }`
              }
            >
              <item.icon className="w-4 h-4" />
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-stone-800">
          <div className="flex items-center gap-3 mb-3 px-2">
            <div className="w-8 h-8 bg-emerald-500/10 border border-emerald-500/30 rounded-full flex items-center justify-center text-xs font-bold text-emerald-400">
              {user?.email?.[0].toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="text-xs text-white font-medium truncate">{user?.email}</p>
              <p className="text-xs text-stone-500">Hybrid</p>
            </div>
          </div>
          <button
            onClick={async () => { await signOut(); navigate('/'); }}
            className="w-full flex items-center gap-2 text-stone-500 hover:text-white text-xs px-2 py-2 rounded hover:bg-stone-800 transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            Sign Out
          </button>
        </div>
      </aside>

      <header className="md:hidden fixed top-0 left-0 right-0 z-40 bg-stone-900 border-b border-stone-800 px-4 h-14 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
          <BookOpen className="w-5 h-5 text-amber-500" />
          <span className="font-bold tracking-widest text-sm">CODEX</span>
        </Link>
        <button onClick={async () => { await signOut(); navigate('/'); }} className="text-stone-400">
          <LogOut className="w-4 h-4" />
        </button>
      </header>

      <main className="md:ml-64 flex-1 p-6 md:p-10 pt-20 md:pt-10">
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-3xl font-bold">The Crossroads</h1>
            <Sparkles className="w-5 h-5 text-emerald-400" />
          </div>
          <p className="text-stone-400 text-sm">Your complete creative command center.</p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          {stats.map((s) => (
            <div key={s.label} className="bg-stone-900 border border-stone-800 rounded-xl p-5">
              <div className={`w-9 h-9 ${s.bg} rounded-lg flex items-center justify-center mb-3`}>
                <s.icon className={`w-4.5 h-4.5 ${s.color}`} />
              </div>
              <div className="text-2xl font-bold text-white mb-0.5">{s.value}</div>
              <div className="text-stone-500 text-xs">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
          {quickActions.map((a) => (
            <button key={a.label} className={`${a.color} font-bold py-3.5 px-4 rounded-xl text-sm tracking-wide transition-all duration-200 flex items-center justify-center gap-2`}>
              <a.icon className="w-4 h-4" />
              {a.label}
            </button>
          ))}
        </div>

        {/* Activity grid */}
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-stone-900 border border-stone-800 rounded-xl p-6">
            <h2 className="font-semibold text-base mb-5">Recent Writing</h2>
            <div className="text-center py-8">
              <PenLine className="w-8 h-8 text-stone-700 mx-auto mb-2" />
              <p className="text-stone-500 text-sm">No stories yet</p>
            </div>
          </div>
          <div className="bg-stone-900 border border-stone-800 rounded-xl p-6">
            <h2 className="font-semibold text-base mb-5">Recent Art</h2>
            <div className="text-center py-8">
              <Image className="w-8 h-8 text-stone-700 mx-auto mb-2" />
              <p className="text-stone-500 text-sm">No artworks yet</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
