import { useNavigate } from 'react-router-dom';
import {
  Eye, BookOpen, LogOut, Search, BookMarked,
  Heart, Star, TrendingUp, Compass, Settings, Clock
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const stats = [
  { label: 'Books Read', value: '0', icon: BookMarked, color: 'text-sky-400', bg: 'bg-sky-500/10' },
  { label: 'In Progress', value: '0', icon: Clock, color: 'text-sky-400', bg: 'bg-sky-500/10' },
  { label: 'Favorites', value: '0', icon: Heart, color: 'text-sky-400', bg: 'bg-sky-500/10' },
  { label: 'Reviews', value: '0', icon: Star, color: 'text-sky-400', bg: 'bg-sky-500/10' },
];

const navItems = [
  { icon: Compass, label: 'Discover' },
  { icon: Search, label: 'Search' },
  { icon: BookMarked, label: 'Reading List' },
  { icon: Heart, label: 'Favorites' },
  { icon: TrendingUp, label: 'Trending' },
  { icon: Settings, label: 'Settings' },
];

const genres = ['Fantasy', 'Sci-Fi', 'Horror', 'Romance', 'Mystery', 'Literary Fiction', 'Thriller', 'Historical'];

export default function ReaderDashboard() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-stone-950 text-white flex">
      <aside className="hidden md:flex fixed left-0 top-0 h-full w-64 bg-stone-900 border-r border-stone-800 flex-col z-40">
        <div className="p-6 border-b border-stone-800">
          <div className="flex items-center gap-2 mb-4">
            <BookOpen className="w-5 h-5 text-amber-500" />
            <span className="font-bold tracking-widest text-sm">CODEX</span>
          </div>
          <div className="inline-flex items-center gap-2 bg-sky-500/10 border border-sky-500/30 rounded-full px-3 py-1">
            <Eye className="w-3.5 h-3.5 text-sky-400" />
            <span className="text-xs font-semibold text-sky-400 tracking-wide">READER</span>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => (
            <button
              key={item.label}
              className="w-full flex items-center gap-3 px-3 py-2.5 text-stone-400 hover:text-white hover:bg-stone-800 rounded-lg text-sm transition-colors text-left"
            >
              <item.icon className="w-4 h-4" />
              {item.label}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-stone-800">
          <div className="flex items-center gap-3 mb-3 px-2">
            <div className="w-8 h-8 bg-sky-500/10 border border-sky-500/30 rounded-full flex items-center justify-center text-xs font-bold text-sky-400">
              {user?.email?.[0].toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="text-xs text-white font-medium truncate">{user?.email}</p>
              <p className="text-xs text-stone-500">Reader</p>
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
        <div className="flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-amber-500" />
          <span className="font-bold tracking-widest text-sm">CODEX</span>
        </div>
        <button onClick={async () => { await signOut(); navigate('/'); }} className="text-stone-400">
          <LogOut className="w-4 h-4" />
        </button>
      </header>

      <main className="md:ml-64 flex-1 p-6 md:p-10 pt-20 md:pt-10">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-1">Reading Den</h1>
          <p className="text-stone-400 text-sm">Discover stories worth losing yourself in.</p>
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
          <div className="md:col-span-2 space-y-5">
            {/* Search */}
            <div className="bg-stone-900 border border-stone-800 rounded-xl p-5">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-500" />
                <input
                  type="text"
                  placeholder="Search stories, authors, genres..."
                  className="w-full bg-stone-800 border border-stone-700 focus:border-sky-500 rounded-lg pl-10 pr-4 py-2.5 text-white placeholder-stone-600 text-sm outline-none transition-colors"
                />
              </div>
            </div>

            <div className="bg-stone-900 border border-stone-800 rounded-xl p-6">
              <h2 className="font-semibold text-base mb-5">Continue Reading</h2>
              <div className="text-center py-10">
                <BookOpen className="w-10 h-10 text-stone-700 mx-auto mb-3" />
                <p className="text-stone-500 text-sm">Your reading list is empty</p>
                <p className="text-stone-600 text-xs mt-1">Discover stories to start reading</p>
              </div>
            </div>
          </div>

          <div className="space-y-5">
            <button className="w-full bg-sky-600 hover:bg-sky-500 text-white font-bold py-3.5 px-4 rounded-xl text-sm tracking-wide transition-all duration-200 flex items-center justify-center gap-2">
              <Compass className="w-4 h-4" />
              Explore Stories
            </button>
            <div className="bg-stone-900 border border-stone-800 rounded-xl p-5">
              <h3 className="font-medium text-sm mb-4">Browse by Genre</h3>
              <div className="flex flex-wrap gap-2">
                {genres.map((g) => (
                  <span key={g} className="bg-stone-800 hover:bg-stone-700 text-stone-400 hover:text-white text-xs px-3 py-1.5 rounded-full cursor-pointer transition-colors">
                    {g}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
