import { useState, useEffect } from 'react';
import { NavLink, useNavigate, Link } from 'react-router-dom';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  BookOpen, LogOut, PenLine, BookMarked, Eye, Home, Settings,
  GripVertical, Loader2, Menu, LayoutGrid
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { supabase, BinderItem } from '../lib/supabase';

const navItems = [
  { icon: Home, label: 'Home', to: '/' },
  { icon: PenLine, label: 'Write', to: '/dashboard/writer' },
  { icon: Eye, label: 'Create Art', to: '/dashboard/artist' },
  { icon: BookMarked, label: 'Reading List', to: '/dashboard/reader' },
  { icon: LayoutGrid, label: 'Storyboard', to: '/storyboard' },
  { icon: Settings, label: 'Settings', to: '#' },
];

const statusConfig: Record<BinderItem['status'], { label: string; color: string; bg: string; border: string; dot: string }> = {
  'draft': { label: 'Draft', color: 'text-stone-400', bg: 'bg-stone-500/10', border: 'border-stone-500/30', dot: 'bg-stone-400' },
  'in-progress': { label: 'In Progress', color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/30', dot: 'bg-amber-400' },
  'review': { label: 'Review', color: 'text-sky-400', bg: 'bg-sky-500/10', border: 'border-sky-500/30', dot: 'bg-sky-400' },
  'done': { label: 'Done', color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/30', dot: 'bg-emerald-400' },
};

const allStatuses: BinderItem['status'][] = ['draft', 'in-progress', 'review', 'done'];

function SortableCard({ item, onStatusChange }: { item: BinderItem; onStatusChange: (id: string, status: BinderItem['status']) => void }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const config = statusConfig[item.status];
  const wordCount = item.content?.trim() ? item.content.trim().split(/\s+/).length : 0;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`group relative bg-stone-900 border rounded-xl p-5 transition-all duration-200 ${
        isDragging
          ? 'border-amber-500/50 shadow-lg shadow-amber-500/10 z-50 opacity-90 scale-[1.02]'
          : 'border-stone-800 hover:border-stone-700'
      }`}
    >
      {/* Drag handle */}
      <button
        {...attributes}
        {...listeners}
        className="absolute top-4 right-4 text-stone-600 hover:text-stone-300 cursor-grab active:cursor-grabbing transition-colors"
      >
        <GripVertical className="w-4 h-4" />
      </button>

      {/* Card number */}
      <div className="flex items-center gap-3 mb-3">
        <span className="text-xs font-mono text-stone-600">#{item.order_index + 1}</span>
        <div className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium ${config.bg} ${config.border} border ${config.color}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
          {config.label}
        </div>
      </div>

      {/* Title */}
      <h3 className="text-sm font-semibold text-white mb-2 pr-8 leading-snug">{item.title}</h3>

      {/* Meta */}
      <div className="flex items-center gap-3 text-xs text-stone-500 mb-3">
        <span>{wordCount} words</span>
        <span className="w-px h-3 bg-stone-700" />
        <span>{new Date(item.updated_at).toLocaleDateString()}</span>
      </div>

      {/* Content preview */}
      {item.content && (
        <p className="text-xs text-stone-500 line-clamp-2 mb-4 leading-relaxed">
          {item.content.slice(0, 120)}{item.content.length > 120 ? '...' : ''}
        </p>
      )}

      {/* Status selector */}
      <div className="flex gap-1.5">
        {allStatuses.map((s) => {
          const sc = statusConfig[s];
          const isActive = item.status === s;
          return (
            <button
              key={s}
              onClick={() => onStatusChange(item.id, s)}
              className={`px-2 py-1 rounded text-[10px] font-medium transition-colors ${
                isActive
                  ? `${sc.bg} ${sc.color} border ${sc.border}`
                  : 'bg-stone-800 text-stone-600 hover:text-stone-400'
              }`}
            >
              {sc.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default function Storyboard() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [items, setItems] = useState<BinderItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    if (user) fetchItems();
  }, [user]);

  const fetchItems = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('binder_items')
      .select('*')
      .eq('user_id', user?.id)
      .order('order_index', { ascending: true });

    if (!error && data) {
      setItems(data);
    }
    setLoading(false);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = items.findIndex((i) => i.id === active.id);
    const newIndex = items.findIndex((i) => i.id === over.id);
    const reordered = arrayMove(items, oldIndex, newIndex);

    // Optimistic update
    const updated = reordered.map((item, index) => ({
      ...item,
      order_index: index,
    }));
    setItems(updated);

    // Persist new order to Supabase
    setSaving(true);
    const updates = updated.map((item) =>
      supabase
        .from('binder_items')
        .update({ order_index: item.order_index })
        .eq('id', item.id)
    );
    await Promise.all(updates);
    setSaving(false);
  };

  const handleStatusChange = async (id: string, status: BinderItem['status']) => {
    // Optimistic update
    setItems(items.map((i) => (i.id === id ? { ...i, status } : i)));

    await supabase
      .from('binder_items')
      .update({ status })
      .eq('id', id);
  };

  return (
    <div className="min-h-screen bg-stone-950 text-white flex">
      {/* Left Navigation Rail */}
      <aside className="hidden md:flex w-16 bg-stone-900 border-r border-stone-800 flex-col items-center py-6 gap-2">
        <NavLink to="/" className="mb-4 hover:opacity-80 transition-opacity" title="Home">
          <BookOpen className="w-6 h-6 text-amber-500" />
        </NavLink>
        <div className="flex-1 flex flex-col gap-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              title={item.label}
              className={({ isActive }) =>
                `w-12 h-12 rounded-xl flex items-center justify-center transition-colors ${
                  isActive && item.to !== '#'
                    ? 'bg-amber-500/10 text-amber-400'
                    : 'text-stone-500 hover:text-white hover:bg-stone-800'
                }`
              }
            >
              <item.icon className="w-5 h-5" />
            </NavLink>
          ))}
        </div>
        <button
          onClick={async () => { await signOut(); navigate('/'); }}
          className="w-12 h-12 rounded-xl flex items-center justify-center text-stone-500 hover:text-white hover:bg-stone-800 transition-colors"
          title="Sign Out"
        >
          <LogOut className="w-5 h-5" />
        </button>
      </aside>

      {/* Mobile Header */}
      <header className="md:hidden fixed top-0 left-0 right-0 z-50 bg-stone-900 border-b border-stone-800 px-4 h-14 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="text-stone-400">
            <Menu className="w-5 h-5" />
          </button>
          <Link to="/" className="hover:opacity-80 transition-opacity">
            <BookOpen className="w-5 h-5 text-amber-500" />
          </Link>
        </div>
        <h1 className="text-sm font-semibold tracking-wide">Storyboard</h1>
        <button onClick={async () => { await signOut(); navigate('/'); }} className="text-stone-400">
          <LogOut className="w-5 h-5" />
        </button>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 pt-14 md:pt-0">
        {/* Header */}
        <div className="px-6 md:px-10 py-6 border-b border-stone-800">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold mb-1">Storyboard</h1>
              <p className="text-stone-400 text-sm">Drag cards to reorder your plot. Click status labels to update progress.</p>
            </div>
            <div className="flex items-center gap-3">
              {saving && (
                <span className="flex items-center gap-2 text-xs text-amber-400 bg-amber-500/10 border border-amber-500/30 px-3 py-1.5 rounded-lg">
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  Saving order...
                </span>
              )}
              <span className="text-xs text-stone-500">{items.length} chapter{items.length !== 1 ? 's' : ''}</span>
            </div>
          </div>

          {/* Status summary bar */}
          {items.length > 0 && (
            <div className="flex gap-4 mt-4">
              {allStatuses.map((s) => {
                const count = items.filter((i) => i.status === s).length;
                const sc = statusConfig[s];
                return (
                  <div key={s} className="flex items-center gap-1.5">
                    <span className={`w-2 h-2 rounded-full ${sc.dot}`} />
                    <span className={`text-xs ${sc.color}`}>{sc.label}</span>
                    <span className="text-xs text-stone-600">({count})</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Card Grid */}
        <div className="flex-1 overflow-y-auto p-6 md:p-10">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-6 h-6 text-stone-500 animate-spin" />
            </div>
          ) : items.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <LayoutGrid className="w-12 h-12 text-stone-700 mb-4" />
              <p className="text-stone-500 text-lg mb-2">No chapters yet</p>
              <p className="text-stone-600 text-sm">Create chapters in the Writer to see them here</p>
              <Link
                to="/dashboard/writer"
                className="mt-6 flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-stone-950 font-semibold px-4 py-2 rounded-lg text-sm transition-colors"
              >
                <PenLine className="w-4 h-4" />
                Go to Writer
              </Link>
            </div>
          ) : (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext items={items.map((i) => i.id)} strategy={verticalListSortingStrategy}>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {items.map((item) => (
                    <SortableCard
                      key={item.id}
                      item={item}
                      onStatusChange={handleStatusChange}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          )}
        </div>
      </main>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-50 bg-stone-950/95 flex flex-col pt-14">
          <div className="flex-1 p-6 space-y-4">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={() => setMobileMenuOpen(false)}
                className={({ isActive }) =>
                  `w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
                    isActive && item.to !== '#'
                      ? 'bg-amber-500/10 text-amber-400'
                      : 'text-stone-400 hover:text-white hover:bg-stone-800'
                  }`
                }
              >
                <item.icon className="w-5 h-5" />
                <span className="text-sm font-medium">{item.label}</span>
              </NavLink>
            ))}
          </div>
          <button
            onClick={() => setMobileMenuOpen(false)}
            className="p-6 border-t border-stone-800 text-center text-amber-400 text-sm font-medium"
          >
            Close Menu
          </button>
        </div>
      )}
    </div>
  );
}
