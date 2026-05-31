import { useNavigate } from 'react-router-dom';
import {
  Feather, BookOpen, LogOut, PenLine, BookMarked,
  BarChart2, Settings, Users, TrendingUp, Clock
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const stats = [
  { label: 'Stories', value: '0', icon: BookMarked, color: 'text-amber-400', bg: 'bg-amber-500/10' },
  { label: 'Words Written', value: '0', icon: PenLine, color: 'text-amber-400', bg: 'bg-amber-500/10' },
  { label: 'Followers', value: '0', icon: Users, color: 'text-amber-400', bg: 'bg-amber-500/10' },
  { label: 'Total Reads', value: '0', icon: TrendingUp, color: 'text-amber-400', bg: 'bg-amber-500/10' },
];

const navItems = [
  { icon: PenLine, label: 'New Story' },
  { icon: BookMarked, label: 'My Stories' },
  { icon: BarChart2, label: 'Analytics' },
  { icon: Users, label: 'Community' },
  { icon: Settings, label: 'Settings' },
];

export default function WriterDashboard() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-stone-950 text-white flex">
      {/* Sidebar */}
      <aside className="hidden md:flex fixed left-0 top-0 h-full w-64 bg-stone-900 border-r border-stone-800 flex-col z-40">
        <div className="p-6 border-b border-stone-800">
          <div className="flex items-center gap-2 mb-4">
            <BookOpen className="w-5 h-5 text-amber-500" />
            <span className="font-bold tracking-widest text-sm">CODEX</span>
          </div>
          <div className="inline-flex items-center gap-2 bg-amber-500/10 border border-amber-500/30 rounded-full px-3 py-1">
            <Feather className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-xs font-semibold text-amber-400 tracking-wide">WRITER</span>
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
            <div className="w-8 h-8 bg-amber-500/10 border border-amber-500/30 rounded-full flex items-center justify-center text-xs font-bold text-amber-400">
              {user?.email?.[0].toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="text-xs text-white font-medium truncate">{user?.email}</p>
              <p className="text-xs text-stone-500">Writer</p>
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

      {/* Mobile header */}
      <header className="md:hidden fixed top-0 left-0 right-0 z-40 bg-stone-900 border-b border-stone-800 px-4 h-14 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-amber-500" />
          <span className="font-bold tracking-widest text-sm">CODEX</span>
        </div>
        <button onClick={async () => { await signOut(); navigate('/'); }} className="text-stone-400">
          <LogOut className="w-4 h-4" />
        </button>
      </header>

      {/* Main */}
      <main className="md:ml-64 flex-1 p-6 md:p-10 pt-20 md:pt-10">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-1">Writer's Studio</h1>
          <p className="text-stone-400 text-sm">Welcome back. Your stories are waiting.</p>
        </div>

        {/* Stats */}
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

        {/* Actions + Recent */}
        <div className="grid md:grid-cols-3 gap-6">
          <div className="md:col-span-2 bg-stone-900 border border-stone-800 rounded-xl p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-semibold text-base">Recent Stories</h2>
              <span className="text-xs text-stone-500">0 stories</span>
            </div>
            <div className="text-center py-12">
              <Feather className="w-10 h-10 text-stone-700 mx-auto mb-3" />
              <p className="text-stone-500 text-sm">No stories yet</p>
              <p className="text-stone-600 text-xs mt-1">Start writing your first story</p>
            </div>
          </div>

          <div className="space-y-4">
            <button className="w-full bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold py-3.5 px-4 rounded-xl text-sm tracking-wide transition-all duration-200 flex items-center justify-center gap-2">
              <PenLine className="w-4 h-4" />
              New Story
            </button>
            <div className="bg-stone-900 border border-stone-800 rounded-xl p-5">
              <h3 className="font-medium text-sm mb-4 flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-500" />
                Writing Streak
              </h3>
              <div className="text-3xl font-bold text-amber-400 mb-1">0</div>
              <div className="text-stone-500 text-xs">days in a row</div>
              <div className="mt-4 grid grid-cols-7 gap-1">
                {Array.from({ length: 14 }).map((_, i) => (
                  <div key={i} className="w-full aspect-square rounded-sm bg-stone-800" />
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
