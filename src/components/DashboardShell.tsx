import { useNavigate } from 'react-router-dom';
import { BookOpen, LogOut, LucideIcon } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface DashboardShellProps {
  title: string;
  subtitle: string;
  accentColor: string;
  accentBg: string;
  accentBorder: string;
  Icon: LucideIcon;
  children: React.ReactNode;
}

export function DashboardShell({
  title,
  subtitle,
  accentColor,
  accentBg,
  accentBorder,
  Icon,
  children,
}: DashboardShellProps) {
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-stone-950 text-white">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 h-full w-64 bg-stone-900 border-r border-stone-800 flex flex-col z-40 hidden md:flex">
        <div className="p-6 border-b border-stone-800">
          <div className="flex items-center gap-2 mb-4">
            <BookOpen className="w-5 h-5 text-amber-500" />
            <span className="font-bold tracking-widest text-sm">CODEX</span>
          </div>
          <div className={`inline-flex items-center gap-2 ${accentBg} ${accentBorder} border rounded-full px-3 py-1`}>
            <Icon className={`w-3.5 h-3.5 ${accentColor}`} />
            <span className={`text-xs font-semibold ${accentColor} tracking-wide`}>{profile?.role?.toUpperCase()}</span>
          </div>
        </div>

        <nav className="flex-1 p-4">
          {children}
        </nav>

        <div className="p-4 border-t border-stone-800">
          <div className="flex items-center gap-3 mb-3 px-2">
            <div className={`w-8 h-8 ${accentBg} ${accentBorder} border rounded-full flex items-center justify-center text-xs font-bold ${accentColor}`}>
              {user?.email?.[0].toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="text-xs text-white font-medium truncate">{user?.email}</p>
              <p className="text-xs text-stone-500 capitalize">{profile?.role}</p>
            </div>
          </div>
          <button
            onClick={handleSignOut}
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
        <button onClick={handleSignOut} className="text-stone-400 hover:text-white">
          <LogOut className="w-4 h-4" />
        </button>
      </header>

      {/* Main content */}
      <main className="md:ml-64 p-6 md:p-10 pt-20 md:pt-10">
        <div className="mb-10">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">{title}</h1>
          <p className="text-stone-400">{subtitle}</p>
        </div>
        {children}
      </main>
    </div>
  );
}
