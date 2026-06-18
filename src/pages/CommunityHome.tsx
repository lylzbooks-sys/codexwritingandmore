import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  PenLine, BookOpen, Palette, Layers,
  Zap, Trophy, Send, Loader2, Feather,
  Eye, Users, LogOut, Star, ChevronRight,
  MessageSquare, Home,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { supabase, SocialUpdate } from '../lib/supabase';

// ─── rank ladder ───────────────────────────────────────────
const RANKS = [
  { name: 'Apprentice', minXp: 0,   color: 'text-stone-400',   bg: 'bg-stone-500/20',   border: 'border-stone-500/30' },
  { name: 'Scribe',     minXp: 100, color: 'text-sky-400',     bg: 'bg-sky-500/20',     border: 'border-sky-500/30' },
  { name: 'Chronicler', minXp: 300, color: 'text-emerald-400', bg: 'bg-emerald-500/20', border: 'border-emerald-500/30' },
  { name: 'Wordsmith',  minXp: 600, color: 'text-amber-400',   bg: 'bg-amber-500/20',   border: 'border-amber-500/30' },
  { name: 'Loremaster', minXp: 1000,color: 'text-rose-400',    bg: 'bg-rose-500/20',    border: 'border-rose-500/30' },
];

function getRankInfo(xp: number) {
  let current = RANKS[0];
  let next = RANKS[1];
  for (let i = 0; i < RANKS.length; i++) {
    if (xp >= RANKS[i].minXp) {
      current = RANKS[i];
      next = RANKS[i + 1] ?? null!;
    }
  }
  const levelXp = next ? xp - current.minXp : xp - current.minXp;
  const neededXp = next ? next.minXp - current.minXp : 1;
  const pct = next ? Math.min(100, Math.round((levelXp / neededXp) * 100)) : 100;
  return { current, next, pct, levelXp, neededXp };
}

const ROLE_META: Record<string, { icon: typeof PenLine; label: string; dashPath: string; color: string }> = {
  writer:  { icon: PenLine,  label: 'Writer',  dashPath: '/dashboard/writer',  color: 'text-amber-400' },
  reader:  { icon: Eye,      label: 'Reader',  dashPath: '/dashboard/reader',  color: 'text-sky-400' },
  artist:  { icon: Palette,  label: 'Artist',  dashPath: '/dashboard/artist',  color: 'text-rose-400' },
  hybrid:  { icon: Layers,   label: 'Hybrid',  dashPath: '/dashboard/hybrid',  color: 'text-emerald-400' },
};

const TIME_AGO = (iso: string) => {
  const secs = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (secs < 60) return `${secs}s ago`;
  if (secs < 3600) return `${Math.floor(secs / 60)}m ago`;
  if (secs < 86400) return `${Math.floor(secs / 3600)}h ago`;
  return `${Math.floor(secs / 86400)}d ago`;
};

const ROLE_COLOR: Record<string, string> = {
  writer: 'text-amber-400',
  reader: 'text-sky-400',
  artist: 'text-rose-400',
  hybrid: 'text-emerald-400',
};

const ROLE_ICON: Record<string, typeof PenLine> = {
  writer: PenLine,
  reader: Eye,
  artist: Palette,
  hybrid: Layers,
};

// ─── Avatar initials ────────────────────────────────────────
function Avatar({ name, role, size = 'md' }: { name: string; role?: string | null; size?: 'sm' | 'md' | 'lg' }) {
  const sizeClass = size === 'sm' ? 'w-7 h-7 text-xs' : size === 'lg' ? 'w-12 h-12 text-base' : 'w-9 h-9 text-sm';
  const initial = (name || '?')[0].toUpperCase();
  const colors: Record<string, string> = {
    writer: 'bg-amber-500/20 border-amber-500/40 text-amber-300',
    reader: 'bg-sky-500/20 border-sky-500/40 text-sky-300',
    artist: 'bg-rose-500/20 border-rose-500/40 text-rose-300',
    hybrid: 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300',
  };
  const cls = colors[role ?? ''] ?? 'bg-stone-700 border-stone-600 text-stone-300';
  return (
    <div className={`${sizeClass} ${cls} border rounded-full flex items-center justify-center font-bold flex-shrink-0`}>
      {initial}
    </div>
  );
}

// ─── Achievement Bar ────────────────────────────────────────
function AchievementBar({ xp }: { xp: number }) {
  const { current, next, pct, levelXp, neededXp } = getRankInfo(xp);
  const [animPct, setAnimPct] = useState(0);

  useEffect(() => {
    const t = setTimeout(() => setAnimPct(pct), 120);
    return () => clearTimeout(t);
  }, [pct]);

  return (
    <div className={`rounded-2xl border ${current.border} bg-gradient-to-r from-stone-900 to-stone-900/60 p-5 flex flex-col gap-3`}>
      <div className="flex items-center justify-between gap-4">
        {/* Rank badge */}
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl ${current.bg} border ${current.border} flex items-center justify-center flex-shrink-0`}>
            <Trophy className={`w-5 h-5 ${current.color}`} />
          </div>
          <div>
            <p className="text-xs text-stone-500 font-medium uppercase tracking-wider">Current Rank</p>
            <p className={`text-base font-bold ${current.color}`}>{current.name}</p>
          </div>
        </div>

        {/* XP counter */}
        <div className="text-right">
          <div className="flex items-center gap-1 justify-end">
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-lg font-bold text-white">{xp.toLocaleString()}</span>
            <span className="text-xs text-stone-500 font-medium">XP</span>
          </div>
          {next && (
            <p className="text-xs text-stone-600 mt-0.5">{neededXp - levelXp} XP to {next.name}</p>
          )}
        </div>
      </div>

      {/* Progress bar */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-xs text-stone-600">{current.name}</span>
          {next ? (
            <span className="text-xs text-stone-600">{next.name}</span>
          ) : (
            <span className="text-xs text-amber-400 font-semibold">Max Rank</span>
          )}
        </div>
        <div className="h-2.5 bg-stone-800 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-700 ease-out ${
              current.name === 'Loremaster'
                ? 'bg-gradient-to-r from-rose-500 to-amber-500'
                : 'bg-gradient-to-r from-amber-500 to-amber-400'
            }`}
            style={{ width: `${animPct}%` }}
          />
        </div>
        <div className="flex items-center justify-between mt-1">
          <span className="text-xs text-stone-700">{levelXp} / {neededXp} XP this level</span>
          <span className="text-xs text-stone-600">{pct}%</span>
        </div>
      </div>
    </div>
  );
}

// ─── Update Card ────────────────────────────────────────────
function UpdateCard({ update, isOwn, onDelete }: { update: SocialUpdate; isOwn: boolean; onDelete: (id: string) => void }) {
  const [confirmDelete, setConfirmDelete] = useState(false);
  const RoleIcon = ROLE_ICON[update.role ?? ''] ?? Users;

  return (
    <article className="group bg-stone-900/60 border border-stone-800 hover:border-stone-700 rounded-xl p-4 transition-colors">
      <div className="flex gap-3">
        <Avatar name={update.username ?? 'A'} role={update.role} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-semibold text-white">{update.username ?? 'Anonymous'}</span>
            <span className={`flex items-center gap-1 text-xs font-medium ${ROLE_COLOR[update.role ?? ''] ?? 'text-stone-500'}`}>
              <RoleIcon className="w-3 h-3" />
              {update.role ? update.role.charAt(0).toUpperCase() + update.role.slice(1) : ''}
            </span>
            <span className="text-xs text-stone-600 ml-auto flex-shrink-0">{TIME_AGO(update.created_at)}</span>
          </div>
          <p className="mt-1.5 text-sm text-stone-300 leading-relaxed whitespace-pre-wrap break-words">{update.content}</p>
        </div>
      </div>

      {isOwn && (
        <div className="mt-2.5 flex justify-end">
          {confirmDelete ? (
            <div className="flex items-center gap-2 text-xs">
              <span className="text-stone-500">Delete this?</span>
              <button onClick={() => onDelete(update.id)} className="text-rose-400 hover:text-rose-300 font-semibold">Yes</button>
              <button onClick={() => setConfirmDelete(false)} className="text-stone-500 hover:text-white">No</button>
            </div>
          ) : (
            <button
              onClick={() => setConfirmDelete(true)}
              className="text-xs text-stone-700 hover:text-rose-400 opacity-0 group-hover:opacity-100 transition-all"
            >
              Delete
            </button>
          )}
        </div>
      )}
    </article>
  );
}

// ─── Main page ──────────────────────────────────────────────
export default function CommunityHome() {
  const { user, profile, signOut } = useAuth();
  const [updates, setUpdates] = useState<SocialUpdate[]>([]);
  const [feedLoading, setFeedLoading] = useState(true);
  const [postText, setPostText] = useState('');
  const [posting, setPosting] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const dashMeta = ROLE_META[profile?.role ?? ''];

  useEffect(() => {
    fetchFeed();
  }, []);

  const fetchFeed = async () => {
    setFeedLoading(true);
    const { data } = await supabase
      .from('social_updates_with_profile')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50);
    if (data) setUpdates(data as SocialUpdate[]);
    setFeedLoading(false);
  };

  const handlePost = async () => {
    const content = postText.trim();
    if (!content || !user) return;
    setPosting(true);

    const { data, error } = await supabase
      .from('social_updates')
      .insert({ user_id: user.id, content })
      .select()
      .single();

    if (!error && data) {
      const enriched: SocialUpdate = {
        ...data,
        username: profile?.username ?? null,
        role: profile?.role ?? null,
        xp: profile?.xp ?? 0,
        rank: profile?.rank ?? 'Apprentice',
      };
      setUpdates([enriched, ...updates]);
      setPostText('');
      if (textareaRef.current) textareaRef.current.style.height = 'auto';
    }
    setPosting(false);
  };

  const handleDelete = async (id: string) => {
    await supabase.from('social_updates').delete().eq('id', id);
    setUpdates(updates.filter(u => u.id !== id));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      handlePost();
    }
  };

  const autoResize = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setPostText(e.target.value);
    e.target.style.height = 'auto';
    e.target.style.height = `${e.target.scrollHeight}px`;
  };

  return (
    <div className="min-h-screen bg-stone-950 text-white">
      {/* Top nav */}
      <nav className="sticky top-0 z-30 border-b border-stone-800/80 bg-stone-950/90 backdrop-blur-sm">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-amber-400" />
            <span className="font-bold text-white tracking-tight">Inkbound</span>
          </div>

          <div className="flex items-center gap-2">
            {dashMeta && (
              <Link
                to={dashMeta.dashPath}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-white transition-colors border border-stone-700"
              >
                <dashMeta.icon className={`w-3.5 h-3.5 ${dashMeta.color}`} />
                My Dashboard
                <ChevronRight className="w-3 h-3 text-stone-600" />
              </Link>
            )}
            <button
              onClick={signOut}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-stone-500 hover:text-white transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              Sign out
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-8">

          {/* ── Left column: feed ── */}
          <div className="flex flex-col gap-6">

            {/* Greeting */}
            <div>
              <h1 className="text-2xl font-bold text-white">
                Welcome back{profile?.username ? `, ${profile.username}` : ''}
              </h1>
              <p className="text-stone-500 text-sm mt-1">What's happening in your creative world today?</p>
            </div>

            {/* Post composer */}
            <div className="bg-stone-900/60 border border-stone-800 rounded-2xl p-4">
              <div className="flex gap-3">
                <Avatar name={profile?.username ?? 'A'} role={profile?.role} size="md" />
                <div className="flex-1 min-w-0">
                  <textarea
                    ref={textareaRef}
                    value={postText}
                    onChange={autoResize}
                    onKeyDown={handleKeyDown}
                    placeholder="Share something with the community..."
                    rows={2}
                    maxLength={500}
                    className="w-full bg-transparent text-sm text-white placeholder-stone-600 resize-none focus:outline-none leading-relaxed"
                    style={{ minHeight: '48px' }}
                  />
                  <div className="flex items-center justify-between mt-2 pt-2 border-t border-stone-800">
                    <span className={`text-xs ${postText.length > 450 ? 'text-amber-400' : 'text-stone-700'}`}>
                      {postText.length}/500
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-stone-700 hidden sm:inline">Cmd+Enter to post</span>
                      <button
                        onClick={handlePost}
                        disabled={!postText.trim() || posting}
                        className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold bg-amber-500 hover:bg-amber-400 text-stone-950 rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        {posting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                        Post
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Feed */}
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-stone-600" />
                <h2 className="text-xs font-semibold text-stone-500 uppercase tracking-wider">Community Updates</h2>
              </div>

              {feedLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-5 h-5 text-stone-600 animate-spin" />
                </div>
              ) : updates.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <Feather className="w-8 h-8 text-stone-700 mb-3" />
                  <p className="text-stone-500 text-sm font-medium">No updates yet</p>
                  <p className="text-stone-700 text-xs mt-1">Be the first to share something with the community.</p>
                </div>
              ) : (
                updates.map(update => (
                  <UpdateCard
                    key={update.id}
                    update={update}
                    isOwn={update.user_id === user?.id}
                    onDelete={handleDelete}
                  />
                ))
              )}
            </div>
          </div>

          {/* ── Right column: sidebar ── */}
          <aside className="flex flex-col gap-6">
            {/* Achievement bar */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Star className="w-4 h-4 text-stone-600" />
                <h2 className="text-xs font-semibold text-stone-500 uppercase tracking-wider">Your Progress</h2>
              </div>
              <AchievementBar xp={profile?.xp ?? 0} />
            </div>

            {/* Quick links */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Home className="w-4 h-4 text-stone-600" />
                <h2 className="text-xs font-semibold text-stone-500 uppercase tracking-wider">Quick Access</h2>
              </div>
              <div className="flex flex-col gap-2">
                {Object.values(ROLE_META).map(meta => (
                  <Link
                    key={meta.dashPath}
                    to={meta.dashPath}
                    className="flex items-center gap-3 p-3 bg-stone-900/60 hover:bg-stone-800/60 border border-stone-800 hover:border-stone-700 rounded-xl transition-colors group"
                  >
                    <div className="w-8 h-8 bg-stone-800 group-hover:bg-stone-700 rounded-lg flex items-center justify-center transition-colors">
                      <meta.icon className={`w-4 h-4 ${meta.color}`} />
                    </div>
                    <span className="text-sm font-medium text-stone-300 group-hover:text-white transition-colors">{meta.label} Dashboard</span>
                    <ChevronRight className="w-3.5 h-3.5 text-stone-700 group-hover:text-stone-500 ml-auto transition-colors" />
                  </Link>
                ))}
              </div>
            </div>

            {/* Rank ladder */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Trophy className="w-4 h-4 text-stone-600" />
                <h2 className="text-xs font-semibold text-stone-500 uppercase tracking-wider">Rank Ladder</h2>
              </div>
              <div className="bg-stone-900/60 border border-stone-800 rounded-xl overflow-hidden">
                {RANKS.map((rank, i) => {
                  const isCurrent = rank.name === getRankInfo(profile?.xp ?? 0).current.name;
                  return (
                    <div
                      key={rank.name}
                      className={`flex items-center gap-3 px-4 py-2.5 ${i < RANKS.length - 1 ? 'border-b border-stone-800/60' : ''} ${isCurrent ? 'bg-stone-800/40' : ''}`}
                    >
                      <Trophy className={`w-3.5 h-3.5 ${rank.color} flex-shrink-0`} />
                      <div className="flex-1 min-w-0">
                        <span className={`text-xs font-semibold ${rank.color}`}>{rank.name}</span>
                        <span className="text-xs text-stone-700 ml-2">{rank.minXp} XP</span>
                      </div>
                      {isCurrent && (
                        <span className="text-xs font-bold text-amber-400 bg-amber-500/10 border border-amber-500/30 px-2 py-0.5 rounded-full">You</span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
