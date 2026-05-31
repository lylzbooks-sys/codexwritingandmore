import { NavLink, useNavigate, Link } from 'react-router-dom';
import {
  Palette, BookOpen, LogOut, Upload, Image,
  Brush, Star, TrendingUp, Settings, Grid3x3, Eye, PenLine, Home, BookMarked
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const stats = [
  { label: 'Artworks', value: '0', icon: Image, color: 'text-rose-400', bg: 'bg-rose-500/10' },
  { label: 'Collections', value: '0', icon: Grid3x3, color: 'text-rose-400', bg: 'bg-rose-500/10' },
  { label: 'Views', value: '0', icon: Eye, color: 'text-rose-400', bg: 'bg-rose-500/10' },
  { label: 'Commissions', value: '0', icon: Star, color: 'text-rose-400', bg: 'bg-rose-500/10' },
];

const navItems = [
  { icon: Home, label: 'Home', to: '/' },
  { icon: PenLine, label: 'Write', to: '/dashboard/writer' },
  { icon: Image, label: 'Create Art', to: '/dashboard/artist' },
  { icon: BookMarked, label: 'Reading List', to: '/dashboard/reader' },
  { icon: Settings, label: 'Settings', to: '#' },
];

const artTypes = ['Cover Art', 'Character Portraits', 'Scene Illustrations', 'Maps & Worlds', 'Abstract', 'Concept Art'];

export default function ArtistDashboard() {
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
          <div className="inline-flex items-center gap-2 bg-rose-500/10 border border-rose-500/30 rounded-full px-3 py-1">
            <Palette className="w-3.5 h-3.5 text-rose-400" />
            <span className="text-xs font-semibold text-rose-400 tracking-wide">ARTIST</span>
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
                    ? 'bg-rose-500/10 text-rose-400'
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
            <div className="w-8 h-8 bg-rose-500/10 border border-rose-500/30 rounded-full flex items-center justify-center text-xs font-bold text-rose-400">
              {user?.email?.[0].toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="text-xs text-white font-medium truncate">{user?.email}</p>
              <p className="text-xs text-stone-500">Artist</p>
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
          <h1 className="text-3xl font-bold mb-1">Artist's Atelier</h1>
          <p className="text-stone-400 text-sm">Your visual world, curated and displayed.</p>
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

        <div className="grid md:grid-cols-3 gap-6">
          <div className="md:col-span-2 bg-stone-900 border border-stone-800 rounded-xl p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-semibold text-base">My Gallery</h2>
              <span className="text-xs text-stone-500">0 artworks</span>
            </div>
            <div className="text-center py-12">
              <Palette className="w-10 h-10 text-stone-700 mx-auto mb-3" />
              <p className="text-stone-500 text-sm">No artworks yet</p>
              <p className="text-stone-600 text-xs mt-1">Upload your first piece to get started</p>
            </div>
          </div>

          <div className="space-y-4">
            <button className="w-full bg-rose-600 hover:bg-rose-500 text-white font-bold py-3.5 px-4 rounded-xl text-sm tracking-wide transition-all duration-200 flex items-center justify-center gap-2">
              <Upload className="w-4 h-4" />
              Upload Artwork
            </button>
            <div className="bg-stone-900 border border-stone-800 rounded-xl p-5">
              <h3 className="font-medium text-sm mb-4">Art Categories</h3>
              <div className="flex flex-wrap gap-2">
                {artTypes.map((t) => (
                  <span key={t} className="bg-stone-800 hover:bg-stone-700 text-stone-400 hover:text-white text-xs px-3 py-1.5 rounded-full cursor-pointer transition-colors">
                    {t}
                  </span>
                ))}
              </div>
            </div>
            <div className="bg-stone-900 border border-stone-800 rounded-xl p-5">
              <h3 className="font-medium text-sm mb-2 flex items-center gap-2">
                <Brush className="w-4 h-4 text-rose-400" />
                Open Commissions
              </h3>
              <p className="text-stone-500 text-xs mb-3">Let writers find your work and commission illustrations.</p>
              <button className="w-full border border-rose-500/30 text-rose-400 hover:bg-rose-500/10 text-xs py-2 rounded-lg transition-colors">
                Enable Commissions
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
