import { Link, useNavigate } from 'react-router-dom';
import { BookOpen, Menu, X } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

export function Navbar() {
  const { user, profile, signOut } = useAuth();
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-stone-950/80 backdrop-blur-md border-b border-stone-800">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 group">
          <BookOpen className="w-6 h-6 text-amber-500 group-hover:text-amber-400 transition-colors" />
          <span className="text-xl font-bold tracking-widest text-white">CODEX</span>
        </Link>

        <div className="hidden md:flex items-center gap-8">
          <Link to="/" className="text-stone-400 hover:text-white text-sm tracking-wide transition-colors">Home</Link>
          {!user ? (
            <>
              <Link to="/login" className="text-stone-400 hover:text-white text-sm tracking-wide transition-colors">Sign In</Link>
              <Link to="/signup" className="bg-amber-500 hover:bg-amber-400 text-stone-950 text-sm font-semibold px-4 py-2 rounded transition-colors">
                Get Started
              </Link>
            </>
          ) : (
            <>
              {profile?.role && (
                <Link to={`/dashboard/${profile.role}`} className="text-stone-400 hover:text-white text-sm tracking-wide transition-colors">
                  Dashboard
                </Link>
              )}
              <button onClick={handleSignOut} className="text-stone-400 hover:text-white text-sm tracking-wide transition-colors">
                Sign Out
              </button>
            </>
          )}
        </div>

        <button className="md:hidden text-stone-400" onClick={() => setOpen(!open)}>
          {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {open && (
        <div className="md:hidden bg-stone-900 border-t border-stone-800 px-6 py-4 flex flex-col gap-4">
          <Link to="/" onClick={() => setOpen(false)} className="text-stone-300 text-sm">Home</Link>
          {!user ? (
            <>
              <Link to="/login" onClick={() => setOpen(false)} className="text-stone-300 text-sm">Sign In</Link>
              <Link to="/signup" onClick={() => setOpen(false)} className="text-amber-500 text-sm font-semibold">Get Started</Link>
            </>
          ) : (
            <>
              {profile?.role && (
                <Link to={`/dashboard/${profile.role}`} onClick={() => setOpen(false)} className="text-stone-300 text-sm">Dashboard</Link>
              )}
              <button onClick={handleSignOut} className="text-stone-300 text-sm text-left">Sign Out</button>
            </>
          )}
        </div>
      )}
    </nav>
  );
}
