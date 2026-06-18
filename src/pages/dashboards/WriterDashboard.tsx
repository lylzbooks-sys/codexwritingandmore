import { useState, useEffect, useRef } from 'react';
import { NavLink, useNavigate, Link } from 'react-router-dom';
import {
  BookOpen, LogOut, PenLine, BookMarked,
  Settings, Plus,
  ChevronRight, ChevronDown, FileText, Folder,
  PanelRightClose, PanelRight, Users as UsersIcon, MapPin as MapPinIcon, ScrollText,
  Trash2, Edit3, Menu, Home, Eye, Loader2, Save, LayoutGrid, X, RotateCcw, Scissors, Copy, Check,
  Upload, Map, ExternalLink
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { supabase, BinderItem, StoryElement, StoryElementCategory, WorldMap, MapPin } from '../../lib/supabase';

const DRAFT_KEY = 'codex_draft_';

function getDraftKey(docId: string) {
  return `${DRAFT_KEY}${docId}`;
}

interface SavedDraft {
  docId: string;
  title: string;
  content: string;
  savedAt: string;
}

function saveDraft(docId: string, title: string, content: string) {
  const draft: SavedDraft = { docId, title, content, savedAt: new Date().toISOString() };
  try {
    localStorage.setItem(getDraftKey(docId), JSON.stringify(draft));
  } catch { /* quota exceeded or private mode */ }
}

function loadDraft(docId: string): SavedDraft | null {
  try {
    const raw = localStorage.getItem(getDraftKey(docId));
    if (!raw) return null;
    return JSON.parse(raw) as SavedDraft;
  } catch {
    return null;
  }
}

function clearDraft(docId: string) {
  try {
    localStorage.removeItem(getDraftKey(docId));
  } catch { /* ignore */ }
}

const navItems = [
  { icon: Home, label: 'Home', to: '/' },
  { icon: PenLine, label: 'Write', to: '/dashboard/writer' },
  { icon: Eye, label: 'Create Art', to: '/dashboard/artist' },
  { icon: BookMarked, label: 'Reading List', to: '/dashboard/reader' },
  { icon: LayoutGrid, label: 'Storyboard', to: '/storyboard' },
  { icon: Settings, label: 'Settings', to: '#' },
];

type BibleTab = StoryElementCategory | 'atlas';

const bibleTabs: { id: BibleTab; label: string; icon: typeof UsersIcon }[] = [
  { id: 'character', label: 'Characters', icon: UsersIcon },
  { id: 'location', label: 'Locations', icon: MapPinIcon },
  { id: 'rule', label: 'World Rules', icon: ScrollText },
  { id: 'atlas', label: 'Atlas', icon: Map },
];

const characterColors = ['bg-amber-500', 'bg-sky-500', 'bg-rose-500', 'bg-emerald-500', 'bg-violet-500', 'bg-orange-500'];

interface AtlasPanelProps {
  worldMap: WorldMap | null;
  mapImageUrl: string | null;
  mapUploading: boolean;
  mapPins: MapPin[];
  mapImageRef: React.RefObject<HTMLDivElement>;
  onMapUpload: (file: File) => void;
  onMapClick: (e: React.MouseEvent<HTMLDivElement>) => void;
  onDeletePin: (pinId: string) => void;
}

function AtlasPanel({ worldMap, mapImageUrl, mapUploading, mapPins, mapImageRef, onMapUpload, onMapClick, onDeletePin }: AtlasPanelProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [hoveredPin, setHoveredPin] = useState<string | null>(null);

  return (
    <div className="flex flex-col h-full">
      {!worldMap ? (
        /* Empty state */
        <div className="flex flex-col items-center justify-center h-full text-center px-6 py-10">
          <div className="w-16 h-16 bg-stone-800 rounded-2xl flex items-center justify-center mb-4 border border-stone-700">
            <Map className="w-7 h-7 text-stone-500" />
          </div>
          <p className="text-sm font-medium text-stone-300 mb-1">No map uploaded</p>
          <p className="text-xs text-stone-600 mb-6 leading-relaxed">
            Upload a world map to start placing location pins and navigating your story's geography.
          </p>
          <div className="flex flex-col gap-2 w-full">
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={mapUploading}
              className="w-full flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-400 text-stone-950 text-xs font-semibold px-4 py-2.5 rounded-lg transition-colors disabled:opacity-50"
            >
              {mapUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
              {mapUploading ? 'Uploading...' : 'Upload Map'}
            </button>
            <NavLink
              to="/artist-guild"
              className="w-full flex items-center justify-center gap-2 bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs font-semibold px-4 py-2.5 rounded-lg transition-colors border border-stone-700"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              Explore Artist Guild
            </NavLink>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={e => { const f = e.target.files?.[0]; if (f) onMapUpload(f); }}
          />
        </div>
      ) : (
        /* Map view */
        <div className="flex flex-col h-full">
          {/* Toolbar */}
          <div className="flex items-center justify-between px-4 py-2.5 border-b border-stone-800 bg-stone-900/30">
            <p className="text-xs text-stone-500">Click map to place a pin</p>
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={mapUploading}
              className="flex items-center gap-1.5 text-xs text-stone-400 hover:text-white transition-colors"
            >
              {mapUploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
              Replace
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={e => { const f = e.target.files?.[0]; if (f) onMapUpload(f); }}
            />
          </div>

          {/* Map image */}
          <div className="flex-1 overflow-hidden relative">
            <div
              ref={mapImageRef}
              onClick={onMapClick}
              className="absolute inset-0 cursor-crosshair"
              style={{ userSelect: 'none' }}
            >
              <img
                src={mapImageUrl!}
                alt="World map"
                className="w-full h-full object-contain"
                draggable={false}
              />
              {/* Pins */}
              {mapPins.map(pin => (
                <div
                  key={pin.id}
                  className="absolute group"
                  style={{ left: `${pin.x_pct}%`, top: `${pin.y_pct}%`, transform: 'translate(-50%, -100%)' }}
                  onMouseEnter={() => setHoveredPin(pin.id)}
                  onMouseLeave={() => setHoveredPin(null)}
                >
                  {/* Pin */}
                  <div className="relative flex flex-col items-center">
                    <div className="w-6 h-6 bg-amber-500 border-2 border-amber-300 rounded-full shadow-lg flex items-center justify-center">
                      <MapPinIcon className="w-3 h-3 text-stone-900" />
                    </div>
                    <div className="w-0.5 h-2 bg-amber-500" />
                  </div>
                  {/* Tooltip */}
                  {hoveredPin === pin.id && (
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-stone-900 border border-stone-700 rounded-lg px-2.5 py-1.5 whitespace-nowrap shadow-xl z-10">
                      <p className="text-xs font-medium text-white">{pin.label ?? 'Unnamed Pin'}</p>
                      <button
                        onClick={e => { e.stopPropagation(); onDeletePin(pin.id); }}
                        className="text-xs text-rose-400 hover:text-rose-300 mt-0.5"
                      >
                        Remove
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

interface AddElementModalProps {
  category: StoryElementCategory;
  onClose: () => void;
  onSave: (data: { name: string; description: string; metadata: Record<string, string> }) => void;
  saving: boolean;
}

function AddElementModal({ category, onClose, onSave, saving }: AddElementModalProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [metaField, setMetaField] = useState('');

  const categoryLabel = category === 'character' ? 'Character' : category === 'location' ? 'Location' : 'Rule';
  const metaLabel = category === 'character' ? 'Role' : category === 'location' ? 'Type' : '';
  const metaPlaceholder = category === 'character' ? 'e.g. Protagonist, Mentor' : category === 'location' ? 'e.g. Settlement, Wilderness' : '';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    const metadata: Record<string, string> = {};
    if (metaField.trim()) {
      const key = category === 'character' ? 'role' : 'type';
      metadata[key] = metaField.trim();
    }
    onSave({ name: name.trim(), description: description.trim(), metadata });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div
        className="bg-stone-900 border border-stone-700 rounded-2xl w-full max-w-md mx-4 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-5 border-b border-stone-800">
          <h3 className="text-sm font-semibold">Add {categoryLabel}</h3>
          <button onClick={onClose} className="text-stone-500 hover:text-white transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="block text-xs text-stone-400 mb-1.5">
              {category === 'rule' ? 'Rule' : 'Name'}
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={category === 'rule' ? 'e.g. Magic requires a cost' : category === 'character' ? 'e.g. Elena Vance' : 'e.g. Thornwood Village'}
              className="w-full bg-stone-800 border border-stone-700 rounded-lg px-3 py-2 text-sm text-white placeholder:text-stone-600 outline-none focus:border-amber-500/50 transition-colors"
              autoFocus
            />
          </div>

          {metaLabel && (
            <div>
              <label className="block text-xs text-stone-400 mb-1.5">{metaLabel}</label>
              <input
                type="text"
                value={metaField}
                onChange={(e) => setMetaField(e.target.value)}
                placeholder={metaPlaceholder}
                className="w-full bg-stone-800 border border-stone-700 rounded-lg px-3 py-2 text-sm text-white placeholder:text-stone-600 outline-none focus:border-amber-500/50 transition-colors"
              />
            </div>
          )}

          <div>
            <label className="block text-xs text-stone-400 mb-1.5">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={
                category === 'character'
                  ? 'Physical description, personality, backstory...'
                  : category === 'location'
                  ? 'Appearance, atmosphere, key features...'
                  : 'Details and implications of this rule...'
              }
              rows={3}
              className="w-full bg-stone-800 border border-stone-700 rounded-lg px-3 py-2 text-sm text-white placeholder:text-stone-600 outline-none focus:border-amber-500/50 transition-colors resize-none"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-stone-400 hover:text-white bg-stone-800 hover:bg-stone-700 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!name.trim() || saving}
              className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg transition-colors ${
                !name.trim() || saving
                  ? 'bg-stone-700 text-stone-500 cursor-not-allowed'
                  : 'bg-amber-500 hover:bg-amber-400 text-stone-950'
              }`}
            >
              {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
              Add {categoryLabel}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function WriterDashboard() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [documents, setDocuments] = useState<BinderItem[]>([]);
  const [activeDocument, setActiveDocument] = useState<BinderItem | null>(null);
  const [editorContent, setEditorContent] = useState('');
  const [editorTitle, setEditorTitle] = useState('');
  const [bibleOpen, setBibleOpen] = useState(true);
  const [activeTab, setActiveTab] = useState<BibleTab>('character');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [expandedChapters, setExpandedChapters] = useState<Set<string>>(new Set());
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const [showSaveIndicator, setShowSaveIndicator] = useState(false);
  const autoSaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const latestContentRef = useRef(editorContent);
  const latestTitleRef = useRef(editorTitle);

  // Drag and drop state
  const [draggedSceneId, setDraggedSceneId] = useState<string | null>(null);
  const [dragOverChapterId, setDragOverChapterId] = useState<string | null>(null);

  // Session recovery state
  const [recoveryDraft, setRecoveryDraft] = useState<SavedDraft | null>(null);
  const [showRecoveryBanner, setShowRecoveryBanner] = useState(false);

  // Text selection state for 'Extract to Scene' feature
  const [selectionRange, setSelectionRange] = useState<{ start: number; end: number; text: string } | null>(null);
  const [toolbarPos, setToolbarPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Story Bible state
  const [storyElements, setStoryElements] = useState<StoryElement[]>([]);
  const [bibleLoading, setBibleLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [elementSaving, setElementSaving] = useState(false);
  const [deleteElementConfirm, setDeleteElementConfirm] = useState<string | null>(null);
  const [compileCopied, setCompileCopied] = useState(false);

  // Atlas state
  const [worldMap, setWorldMap] = useState<WorldMap | null>(null);
  const [mapPins, setMapPins] = useState<MapPin[]>([]);
  const [mapImageUrl, setMapImageUrl] = useState<string | null>(null);
  const [mapUploading, setMapUploading] = useState(false);
  const [pendingPin, setPendingPin] = useState<{ x: number; y: number } | null>(null);
  const [pinModalOpen, setPinModalOpen] = useState(false);
  const [pinLinking, setPinLinking] = useState(false);
  const [selectedLocationId, setSelectedLocationId] = useState<string>('');
  const mapImageRef = useRef<HTMLDivElement>(null);

  // Derived state
  const chapters = documents.filter(d => d.item_type === 'chapter').sort((a, b) => a.order_index - b.order_index);
  const getScenes = (chapterId: string) => documents.filter(d => d.parent_id === chapterId).sort((a, b) => a.order_index - b.order_index);

  // Fetch documents on mount
  useEffect(() => {
    if (user) {
      fetchDocuments();
      fetchStoryElements();
      fetchWorldMap();
    }
  }, [user]);

  // Keyboard shortcut for save
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        if (activeDocument && !saving) {
          if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);
          saveDocument();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeDocument, saving, editorContent, editorTitle]);

  // Auto-save after 1.5s of inactivity
  useEffect(() => {
    latestContentRef.current = editorContent;
    latestTitleRef.current = editorTitle;

    if (!activeDocument || saving) return;

    if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);

    autoSaveTimerRef.current = setTimeout(() => {
      if (
        activeDocument &&
        (latestContentRef.current !== activeDocument.content ||
          latestTitleRef.current !== activeDocument.title)
      ) {
        saveDocument();
      }
    }, 1500);

    return () => {
      if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);
    };
  }, [editorContent, editorTitle, activeDocument, saving]);

  // Auto-hide save indicator
  useEffect(() => {
    if (saveStatus === 'saved' && showSaveIndicator) {
      const timer = setTimeout(() => {
        setShowSaveIndicator(false);
        setSaveStatus('idle');
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [saveStatus, showSaveIndicator]);

  // Save to localStorage whenever content changes (before DB save)
  useEffect(() => {
    if (activeDocument && (editorContent !== activeDocument.content || editorTitle !== activeDocument.title)) {
      saveDraft(activeDocument.id, editorTitle, editorContent);
    }
  }, [editorContent, editorTitle, activeDocument]);

  // On successful DB save, clear localStorage draft
  useEffect(() => {
    if (saveStatus === 'saved' && activeDocument) {
      clearDraft(activeDocument.id);
    }
  }, [saveStatus, activeDocument]);

  // Check for recoverable draft when activeDocument changes
  useEffect(() => {
    if (!activeDocument) {
      setShowRecoveryBanner(false);
      setRecoveryDraft(null);
      return;
    }

    const draft = loadDraft(activeDocument.id);
    if (draft && (draft.content !== activeDocument.content || draft.title !== activeDocument.title)) {
      setRecoveryDraft(draft);
      setShowRecoveryBanner(true);
    } else {
      setRecoveryDraft(null);
      setShowRecoveryBanner(false);
    }
  }, [activeDocument?.id]);

  const fetchDocuments = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('binder_items')
      .select('*')
      .eq('user_id', user?.id)
      .order('order_index', { ascending: true });

    if (!error && data) {
      setDocuments(data);
      const firstChapter = data.find(d => d.item_type === 'chapter');
      if (firstChapter && !activeDocument) {
        setActiveDocument(firstChapter);
        setEditorContent(firstChapter.content || '');
        setEditorTitle(firstChapter.title);
        setExpandedChapters(new Set([firstChapter.id]));
      }
    }
    setLoading(false);
  };

  const fetchStoryElements = async () => {
    setBibleLoading(true);
    const { data, error } = await supabase
      .from('story_elements')
      .select('*')
      .eq('user_id', user?.id)
      .order('created_at', { ascending: true });

    if (!error && data) {
      setStoryElements(data);
    }
    setBibleLoading(false);
  };

  const addChapter = async () => {
    const title = `Chapter ${chapters.length + 1}`;
    const { data, error } = await supabase
      .from('binder_items')
      .insert({
        user_id: user?.id,
        title,
        content: '',
        item_type: 'chapter',
        parent_id: null,
        order_index: chapters.length,
      })
      .select()
      .single();

    if (!error && data) {
      setDocuments([...documents, data]);
      setActiveDocument(data);
      setEditorContent('');
      setEditorTitle(data.title);
      setExpandedChapters(new Set([...expandedChapters, data.id]));
    }
  };

  const addScene = async (chapterId: string) => {
    const scenes = getScenes(chapterId);
    const title = `Scene ${scenes.length + 1}`;
    const { data, error } = await supabase
      .from('binder_items')
      .insert({
        user_id: user?.id,
        title,
        content: '',
        item_type: 'scene',
        parent_id: chapterId,
        order_index: scenes.length,
      })
      .select()
      .single();

    if (!error && data) {
      setDocuments([...documents, data]);
      setActiveDocument(data);
      setEditorContent('');
      setEditorTitle(data.title);
      setExpandedChapters(new Set([...expandedChapters, chapterId]));
    }
  };

  const selectDocument = (doc: BinderItem) => {
    setActiveDocument(doc);
    setEditorContent(doc.content || '');
    setEditorTitle(doc.title);
    setSelectionRange(null);
  };

  const saveDocument = async () => {
    if (!activeDocument) return;
    setSaving(true);
    setSaveStatus('saving');
    setShowSaveIndicator(true);

    const { error } = await supabase
      .from('binder_items')
      .update({ title: editorTitle, content: editorContent })
      .eq('id', activeDocument.id);

    if (!error) {
      setDocuments(documents.map(d =>
        d.id === activeDocument.id ? { ...d, title: editorTitle, content: editorContent } : d
      ));
      setActiveDocument({ ...activeDocument, title: editorTitle, content: editorContent });
      setSaveStatus('saved');
    } else {
      setSaveStatus('idle');
    }
    setSaving(false);
  };

  const deleteDocument = async (docId: string) => {
    const doc = documents.find(d => d.id === docId);
    if (!doc) return;

    const { error } = await supabase
      .from('binder_items')
      .delete()
      .eq('id', docId);

    if (!error) {
      let updatedDocs = documents.filter(d => d.id !== docId);
      // If deleting a chapter, also remove its scenes from state
      if (doc.item_type === 'chapter') {
        updatedDocs = updatedDocs.filter(d => d.parent_id !== docId);
      }
      setDocuments(updatedDocs);
      setDeleteConfirm(null);
      if (activeDocument?.id === docId) {
        if (updatedDocs.length > 0) {
          const next = updatedDocs.find(d => d.item_type === 'chapter') || updatedDocs[0];
          selectDocument(next);
        } else {
          setActiveDocument(null);
          setEditorContent('');
          setEditorTitle('');
        }
      }
    }
  };

  // Text selection handlers for 'Extract to Scene'
  const handleTextSelection = (e: MouseEvent | KeyboardEvent) => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    if (start !== end) {
      const text = textarea.value.slice(start, end);
      setSelectionRange({ start, end, text });
      // Position toolbar near the selection
      const rect = textarea.getBoundingClientRect();
      const parentRect = textarea.parentElement!.getBoundingClientRect();
      let x = 16;
      let y = 16;
      if ('clientX' in e) {
        x = e.clientX - parentRect.left + 12;
        y = e.clientY - parentRect.top + 12;
      } else {
        const charWidth = 8;
        const lineHeight = 24;
        const cols = Math.floor(rect.width / charWidth);
        x = (start % cols) * charWidth + (rect.left - parentRect.left) + 16;
        y = Math.floor(start / cols) * lineHeight + (rect.top - parentRect.top) + 16;
      }
      // Clamp within parent bounds
      x = Math.max(8, Math.min(x, parentRect.width - 140));
      y = Math.max(8, Math.min(y, parentRect.height - 40));
      setToolbarPos({ x, y });
    } else {
      setSelectionRange(null);
    }
  };

  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    const onMouseUp = (e: MouseEvent) => handleTextSelection(e);
    const onKeyUp = (e: KeyboardEvent) => handleTextSelection(e);
    textarea.addEventListener('mouseup', onMouseUp);
    textarea.addEventListener('keyup', onKeyUp);
    return () => {
      textarea.removeEventListener('mouseup', onMouseUp);
      textarea.removeEventListener('keyup', onKeyUp);
    };
  }, [activeDocument]);

  const extractToScene = async () => {
    if (!selectionRange || !activeDocument || activeDocument.item_type !== 'chapter') return;
    const parentId = activeDocument.id;
    const { start, end, text } = selectionRange;

    // Remove the highlighted text from the chapter
    const before = editorContent.slice(0, start);
    const after = editorContent.slice(end);
    const newContent = before + after;
    setEditorContent(newContent);
    setSelectionRange(null);

    // Update chapter in DB
    await supabase
      .from('binder_items')
      .update({ content: newContent })
      .eq('id', parentId);

    // Get the next order index for the new scene
    const siblingScenes = getScenes(parentId);
    const nextOrder = siblingScenes.length;

    // Create new scene
    const { data: newScene, error } = await supabase
      .from('binder_items')
      .insert({
        user_id: user?.id,
        title: `Scene ${nextOrder + 1}`,
        content: text,
        item_type: 'scene',
        parent_id: parentId,
        order_index: nextOrder,
      })
      .select()
      .single();

    if (!error && newScene) {
      setDocuments([...documents, newScene]);
      setExpandedChapters(new Set([...expandedChapters, parentId]));
      selectDocument(newScene);
    }
  };

  const compileAndCopy = async () => {
    if (!activeDocument || activeDocument.item_type !== 'chapter') return;
    const scenes = getScenes(activeDocument.id);
    const parts: string[] = [];
    if (activeDocument.content?.trim()) {
      parts.push(activeDocument.content.trim());
    }
    for (const scene of scenes) {
      if (scene.content?.trim()) {
        parts.push(scene.content.trim());
      }
    }
    const compiled = parts.join('\n\n\n***\n\n\n');
    try {
      await navigator.clipboard.writeText(compiled);
      setCompileCopied(true);
      setTimeout(() => setCompileCopied(false), 2000);
    } catch {
      // ignore
    }
  };

  // Story element CRUD
  const addStoryElement = async (data: { name: string; description: string; metadata: Record<string, string> }) => {
    setElementSaving(true);
    const { data: newEl, error } = await supabase
      .from('story_elements')
      .insert({
        user_id: user?.id,
        category: activeTab,
        name: data.name,
        description: data.description,
        metadata: data.metadata,
      })
      .select()
      .single();

    if (!error && newEl) {
      setStoryElements([...storyElements, newEl]);
      setModalOpen(false);
    }
    setElementSaving(false);
  };

  const deleteStoryElement = async (id: string) => {
    const { error } = await supabase
      .from('story_elements')
      .delete()
      .eq('id', id);

    if (!error) {
      setStoryElements(storyElements.filter(el => el.id !== id));
      setDeleteElementConfirm(null);
    }
  };

  // Atlas functions
  const fetchWorldMap = async () => {
    if (!user) return;
    const { data: mapData } = await supabase
      .from('world_maps')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (mapData) {
      setWorldMap(mapData);
      // Use signed URL for private bucket
      const { data: signedData } = await supabase.storage
        .from('world_maps')
        .createSignedUrl(mapData.storage_path, 3600);
      if (signedData) setMapImageUrl(signedData.signedUrl);

      const { data: pins } = await supabase
        .from('map_pins')
        .select('*')
        .eq('map_id', mapData.id)
        .order('created_at', { ascending: true });
      if (pins) setMapPins(pins);
    }
  };

  const handleMapUpload = async (file: File) => {
    if (!user) return;
    setMapUploading(true);
    const ext = file.name.split('.').pop();
    const path = `${user.id}/world_map_${Date.now()}.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from('world_maps')
      .upload(path, file, { upsert: true });

    if (!uploadError) {
      // Delete old map record if any
      if (worldMap) {
        await supabase.from('world_maps').delete().eq('id', worldMap.id);
        await supabase.from('map_pins').delete().eq('map_id', worldMap.id);
        setMapPins([]);
      }
      const { data: newMap } = await supabase
        .from('world_maps')
        .insert({ user_id: user.id, storage_path: path })
        .select()
        .single();
      if (newMap) {
        setWorldMap(newMap);
        const { data: signedData } = await supabase.storage
          .from('world_maps')
          .createSignedUrl(path, 3600);
        if (signedData) setMapImageUrl(signedData.signedUrl);
      }
    }
    setMapUploading(false);
  };

  const handleMapClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!worldMap || !mapImageRef.current) return;
    const rect = mapImageRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setPendingPin({ x, y });
    setSelectedLocationId('');
    setPinModalOpen(true);
  };

  const savePin = async () => {
    if (!pendingPin || !worldMap || !user) return;
    setPinLinking(true);
    const locationEl = storyElements.find(el => el.id === selectedLocationId);
    const { data: pin } = await supabase
      .from('map_pins')
      .insert({
        user_id: user.id,
        map_id: worldMap.id,
        story_element_id: selectedLocationId || null,
        x_pct: pendingPin.x,
        y_pct: pendingPin.y,
        label: locationEl?.name ?? null,
      })
      .select()
      .single();
    if (pin) setMapPins([...mapPins, pin]);
    setPinModalOpen(false);
    setPendingPin(null);
    setPinLinking(false);
  };

  const deletePin = async (pinId: string) => {
    await supabase.from('map_pins').delete().eq('id', pinId);
    setMapPins(mapPins.filter(p => p.id !== pinId));
  };

  const toggleExpandChapter = (chapterId: string) => {
    const newExpanded = new Set(expandedChapters);
    if (newExpanded.has(chapterId)) newExpanded.delete(chapterId);
    else newExpanded.add(chapterId);
    setExpandedChapters(newExpanded);
  };

  // Drag and drop handlers
  const handleDragStart = (sceneId: string) => {
    setDraggedSceneId(sceneId);
  };

  const handleDragOver = (e: React.DragEvent, chapterId: string) => {
    e.preventDefault();
    setDragOverChapterId(chapterId);
  };

  const handleDragLeave = () => {
    setDragOverChapterId(null);
  };

  const handleDrop = async (e: React.DragEvent, chapterId: string) => {
    e.preventDefault();
    if (!draggedSceneId) return;

    const scene = documents.find(d => d.id === draggedSceneId);
    if (!scene || scene.parent_id === chapterId) {
      setDragOverChapterId(null);
      setDraggedSceneId(null);
      return;
    }

    const { error } = await supabase
      .from('binder_items')
      .update({ parent_id: chapterId })
      .eq('id', draggedSceneId);

    if (!error) {
      setDocuments(documents.map(d =>
        d.id === draggedSceneId ? { ...d, parent_id: chapterId } : d
      ));
      setExpandedChapters(new Set([...expandedChapters, chapterId]));
    }
    setDragOverChapterId(null);
    setDraggedSceneId(null);
  };

  const wordCount = editorContent.trim() ? editorContent.trim().split(/\s+/).length : 0;

  const filteredElements = storyElements.filter(el => activeTab !== 'atlas' && el.category === activeTab);
  const locationElements = storyElements.filter(el => el.category === 'location');

  const handleRestoreDraft = () => {
    if (!recoveryDraft) return;
    setEditorContent(recoveryDraft.content);
    setEditorTitle(recoveryDraft.title);
    setShowRecoveryBanner(false);
    setRecoveryDraft(null);
  };

  const handleDismissRecovery = () => {
    if (activeDocument) clearDraft(activeDocument.id);
    setShowRecoveryBanner(false);
    setRecoveryDraft(null);
  };

  return (
    <div className="min-h-screen bg-stone-950 text-white flex overflow-hidden">
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
          <Link to="/" className="text-stone-400 hover:text-white transition-colors">
            <BookOpen className="w-5 h-5 text-amber-500" />
          </Link>
        </div>
        <h1 className="text-sm font-semibold tracking-wide">The Writer&apos;s Engine</h1>
        <button onClick={async () => { await signOut(); navigate('/'); }} className="text-stone-400">
          <LogOut className="w-5 h-5" />
        </button>
      </header>

      {/* THE BINDER - Left Sidebar */}
      <aside
        className={`${
          sidebarOpen ? 'w-72' : 'w-12'
        } hidden md:flex flex-col bg-stone-900/50 border-r border-stone-800 transition-all duration-300 overflow-hidden`}
      >
        {sidebarOpen ? (
          <>
            <div className="p-4 border-b border-stone-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-amber-500/10 rounded-lg flex items-center justify-center">
                  <PenLine className="w-4 h-4 text-amber-400" />
                </div>
                <div>
                  <h2 className="text-sm font-semibold">The Binder</h2>
                  <p className="text-xs text-stone-500">{chapters.length} chapter{chapters.length !== 1 ? 's' : ''}</p>
                </div>
              </div>
              <button onClick={() => setSidebarOpen(false)} className="text-stone-500 hover:text-white transition-colors">
                <PanelRightClose className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-3 space-y-1">
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-5 h-5 text-stone-500 animate-spin" />
                </div>
              ) : chapters.length === 0 ? (
                <div className="text-center py-8">
                  <Folder className="w-8 h-8 text-stone-700 mx-auto mb-2" />
                  <p className="text-xs text-stone-500">No chapters yet</p>
                  <p className="text-xs text-stone-600 mt-1">Click &quot;Add Chapter&quot; to begin</p>
                </div>
              ) : (
                chapters.map((chapter) => {
                  const scenes = getScenes(chapter.id);
                  const isExpanded = expandedChapters.has(chapter.id);
                  const isDragOver = dragOverChapterId === chapter.id;
                  const isActive = activeDocument?.id === chapter.id;

                  return (
                    <div key={chapter.id} className="select-none">
                      {/* Chapter Row */}
                      <div
                        className={`group flex items-center gap-2 px-2 py-1.5 rounded-lg cursor-pointer transition-all ${
                          isActive ? 'bg-amber-500/10' : 'hover:bg-stone-800/50'
                        } ${isDragOver ? 'ring-1 ring-amber-500/50 bg-amber-500/5' : ''}`}
                        onClick={() => selectDocument(chapter)}
                        onDragOver={(e) => handleDragOver(e, chapter.id)}
                        onDragLeave={handleDragLeave}
                        onDrop={(e) => handleDrop(e, chapter.id)}
                      >
                        <button
                          onClick={(e) => { e.stopPropagation(); toggleExpandChapter(chapter.id); }}
                          className="text-stone-500 hover:text-stone-300 transition-colors"
                        >
                          {isExpanded ? (
                            <ChevronDown className="w-3.5 h-3.5 flex-shrink-0" />
                          ) : (
                            <ChevronRight className="w-3.5 h-3.5 flex-shrink-0" />
                          )}
                        </button>
                        <Folder className={`w-3.5 h-3.5 flex-shrink-0 ${isActive ? 'text-amber-400' : 'text-stone-500'}`} />
                        <span className={`text-xs truncate flex-1 ${isActive ? 'text-amber-400' : 'text-stone-300'}`}>
                          {chapter.title}
                        </span>
                        <button
                          onClick={(e) => { e.stopPropagation(); setDeleteConfirm(chapter.id); }}
                          className="opacity-0 group-hover:opacity-100 text-stone-500 hover:text-rose-400 transition-all"
                          title="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Scenes List */}
                      {isExpanded && (
                        <div className="ml-4 mt-0.5 space-y-0.5">
                          {scenes.map((scene) => {
                            const isSceneActive = activeDocument?.id === scene.id;
                            return (
                              <div
                                key={scene.id}
                                draggable
                                onDragStart={() => handleDragStart(scene.id)}
                                className={`group flex items-center gap-2 px-2 py-1.5 rounded-lg cursor-move transition-all ${
                                  isSceneActive ? 'bg-amber-500/10' : 'hover:bg-stone-800/40'
                                }`}
                                onClick={() => selectDocument(scene)}
                              >
                                <FileText className={`w-3 h-3 flex-shrink-0 ${isSceneActive ? 'text-amber-400' : 'text-stone-600'}`} />
                                <span className={`text-xs truncate flex-1 ${isSceneActive ? 'text-amber-400' : 'text-stone-400'}`}>
                                  {scene.title}
                                </span>
                                <button
                                  onClick={(e) => { e.stopPropagation(); setDeleteConfirm(scene.id); }}
                                  className="opacity-0 group-hover:opacity-100 text-stone-500 hover:text-rose-400 transition-all"
                                  title="Delete"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              </div>
                            );
                          })}
                          <button
                            onClick={() => addScene(chapter.id)}
                            className="flex items-center gap-1.5 px-2 py-1 text-xs text-stone-500 hover:text-stone-300 transition-colors rounded-lg hover:bg-stone-800/30"
                          >
                            <Plus className="w-3 h-3" />
                            Add Scene
                          </button>
                        </div>
                      )}

                      {/* Delete confirmation */}
                      {deleteConfirm === chapter.id && (
                        <div className="ml-4 mt-1 p-2 bg-rose-500/10 border border-rose-500/30 rounded-lg">
                          <p className="text-xs text-rose-400 mb-2">Delete this chapter and all its scenes?</p>
                          <div className="flex gap-2">
                            <button onClick={() => deleteDocument(chapter.id)} className="text-xs bg-rose-500 hover:bg-rose-400 text-white px-2 py-1 rounded">Delete</button>
                            <button onClick={() => setDeleteConfirm(null)} className="text-xs bg-stone-700 hover:bg-stone-600 text-stone-300 px-2 py-1 rounded">Cancel</button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>

            <div className="p-3 border-t border-stone-800">
              <button
                onClick={addChapter}
                className="w-full flex items-center justify-center gap-2 text-stone-400 hover:text-white hover:bg-stone-800 rounded-lg py-2 text-xs font-medium transition-colors"
              >
                <Plus className="w-4 h-4" />
                Add Chapter
              </button>
            </div>
          </>
        ) : (
          <button onClick={() => setSidebarOpen(true)} className="w-12 h-12 flex items-center justify-center text-stone-500 hover:text-white transition-colors">
            <PanelRight className="w-4 h-4" />
          </button>
        )}
      </aside>

      {/* THE EDITOR - Center */}
      <main className="flex-1 flex flex-col min-w-0 pt-14 md:pt-0">
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-800 bg-stone-900/30">
          <div className="flex items-center gap-4 flex-1 min-w-0">
            <input
              type="text"
              value={editorTitle}
              onChange={(e) => setEditorTitle(e.target.value)}
              className="bg-transparent border-none outline-none text-sm text-white font-medium flex-1 min-w-0"
              placeholder="Untitled Document"
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-stone-600">{wordCount} words</span>
            <button
              onClick={() => setBibleOpen(!bibleOpen)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                bibleOpen
                  ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                  : 'bg-stone-800 text-stone-400 hover:text-white'
              }`}
            >
              {bibleOpen ? <PanelRightClose className="w-3.5 h-3.5" /> : <PanelRight className="w-3.5 h-3.5" />}
              Story Bible
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {/* Session Recovery Banner */}
          {showRecoveryBanner && recoveryDraft && activeDocument && (
            <div className="bg-amber-500/10 border-b border-amber-500/30 px-6 py-3 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 min-w-0">
                <RotateCcw className="w-4 h-4 text-amber-400 flex-shrink-0" />
                <div className="min-w-0">
                  <p className="text-xs text-amber-300 font-medium">Unsaved draft recovered</p>
                  <p className="text-xs text-stone-500">
                    Last edited {new Date(recoveryDraft.savedAt).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <button
                  onClick={handleRestoreDraft}
                  className="flex items-center gap-1.5 bg-amber-500 hover:bg-amber-400 text-stone-950 text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Restore
                </button>
                <button
                  onClick={handleDismissRecovery}
                  className="text-xs text-stone-400 hover:text-white px-2 py-1.5 transition-colors"
                >
                  Dismiss
                </button>
              </div>
            </div>
          )}

          {activeDocument ? (
            <div className="w-full h-full flex flex-col relative">
              <textarea
                ref={textareaRef}
                value={editorContent}
                onChange={(e) => setEditorContent(e.target.value)}
                className="editor-textarea flex-1 focus:outline-none"
                placeholder="Begin your story here... The cursor blinks, waiting for your first words."
              />
              {/* Floating Extract-to-Scene Toolbar */}
              {selectionRange && activeDocument?.item_type === 'chapter' && (
                <div
                  style={{
                    position: 'absolute',
                    left: `${toolbarPos.x}px`,
                    top: `${toolbarPos.y}px`,
                    zIndex: 50,
                  }}
                  className="bg-stone-900 border border-stone-700 shadow-lg rounded-lg px-3 py-2 flex items-center gap-2 animate-in fade-in zoom-in-95 duration-150"
                >
                  <button
                    onClick={extractToScene}
                    className="flex items-center gap-1.5 text-xs font-semibold text-amber-400 hover:text-amber-300 transition-colors"
                  >
                    <Scissors className="w-3.5 h-3.5" />
                    Extract to Scene
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center px-8">
              <FileText className="w-12 h-12 text-stone-700 mb-4" />
              <p className="text-stone-500 text-lg mb-2">No document selected</p>
              <p className="text-stone-600 text-sm mb-6">Create a new chapter to start writing</p>
              <button onClick={addChapter} className="flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-stone-950 font-semibold px-4 py-2 rounded-lg transition-colors">
                <Plus className="w-4 h-4" />
                Add Chapter
              </button>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between px-6 py-4 border-t border-stone-800 bg-stone-900/30 gap-4">
          <div className="flex items-center gap-3 text-xs">
            {showSaveIndicator && (
              <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg font-medium transition-all save-status-enter ${
                saveStatus === 'saving'
                  ? 'text-amber-400 bg-amber-500/10 border border-amber-500/30'
                  : 'text-emerald-400 bg-emerald-500/10 border border-emerald-500/30'
              }`}>
                {saveStatus === 'saving' ? (
                  <><Loader2 className="w-3.5 h-3.5 animate-spin" /><span>Saving...</span></>
                ) : (
                  <><span>&#10003;</span><span>Saved</span></>
                )}
              </div>
            )}
            {activeDocument && !showSaveIndicator && (
              <span className="text-stone-600">
                Last saved: {new Date(activeDocument.updated_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-stone-600 hidden sm:inline">Cmd+S to save</span>
            {activeDocument?.item_type === 'chapter' && (
              <button
                onClick={compileAndCopy}
                className={`flex items-center gap-2 text-xs font-semibold px-4 py-2 rounded-lg transition-colors border ${
                  compileCopied
                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                    : 'bg-stone-800 hover:bg-stone-700 text-stone-300 border-stone-700'
                }`}
              >
                {compileCopied ? (
                  <><Check className="w-3.5 h-3.5" />Copied!</>
                ) : (
                  <><Copy className="w-3.5 h-3.5" />Compile & Copy</>
                )}
              </button>
            )}
            <button
              onClick={saveDocument}
              disabled={!activeDocument || saving}
              className={`flex items-center gap-2 text-xs font-semibold px-4 py-2 rounded-lg transition-colors ${
                !activeDocument || saving
                  ? 'bg-stone-700 text-stone-500 cursor-not-allowed'
                  : 'bg-amber-500 hover:bg-amber-400 text-stone-950'
              }`}
            >
              {saving ? (
                <><Loader2 className="w-3.5 h-3.5 animate-spin" />Saving...</>
              ) : (
                <><Save className="w-3.5 h-3.5" />Save Changes</>
              )}
            </button>
          </div>
        </div>
      </main>

      {/* THE STORY BIBLE - Right Sidebar */}
      {bibleOpen && (
        <aside className="hidden lg:flex w-80 flex-col bg-stone-900/50 border-l border-stone-800">
          <div className="p-4 border-b border-stone-800">
            <h2 className="font-semibold text-sm mb-3">Story Bible</h2>
            <div className="flex gap-1">
              {bibleTabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 flex items-center justify-center gap-1.5 px-2 py-2 rounded-lg text-xs font-medium transition-colors ${
                    activeTab === tab.id
                      ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                      : 'text-stone-400 hover:text-white hover:bg-stone-800'
                  }`}
                >
                  <tab.icon className="w-3.5 h-3.5" />
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {activeTab === 'atlas' ? (
              <AtlasPanel
                worldMap={worldMap}
                mapImageUrl={mapImageUrl}
                mapUploading={mapUploading}
                mapPins={mapPins}
                mapImageRef={mapImageRef}
                onMapUpload={handleMapUpload}
                onMapClick={handleMapClick}
                onDeletePin={deletePin}
              />
            ) : bibleLoading ? (
              <div className="flex items-center justify-center py-8 pt-8">
                <Loader2 className="w-5 h-5 text-stone-500 animate-spin" />
              </div>
            ) : (
              <div className="space-y-3 p-4">
                <button
                  onClick={() => setModalOpen(true)}
                  className="w-full flex items-center gap-2 text-stone-400 hover:text-white text-xs py-2 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Add {activeTab === 'character' ? 'Character' : activeTab === 'location' ? 'Location' : 'Rule'}
                </button>

                {filteredElements.length === 0 ? (
                  <div className="text-center py-6">
                    <p className="text-xs text-stone-600">No {activeTab}s yet</p>
                  </div>
                ) : (
                  filteredElements.map((el, i) => (
                    <div
                      key={el.id}
                      className="group relative"
                    >
                      {activeTab === 'character' && (
                        <div className="flex items-center gap-3 p-3 bg-stone-800/50 hover:bg-stone-800 rounded-xl cursor-pointer transition-colors">
                          <div className={`w-10 h-10 ${characterColors[i % characterColors.length]} rounded-full flex items-center justify-center text-white text-sm font-bold`}>
                            {el.name[0]}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-white truncate">{el.name}</p>
                            <p className="text-xs text-stone-500">{el.metadata?.role || 'No role'}</p>
                          </div>
                          <button className="opacity-0 group-hover:opacity-100 text-stone-500 hover:text-white transition-all">
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}

                      {activeTab === 'location' && (
                        <div className="flex items-center gap-3 p-3 bg-stone-800/50 hover:bg-stone-800 rounded-xl cursor-pointer transition-colors">
                          <div className="w-10 h-10 bg-stone-700 rounded-lg flex items-center justify-center">
                            <MapPinIcon className="w-4 h-4 text-stone-400" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-white truncate">{el.name}</p>
                            <p className="text-xs text-stone-500">{el.metadata?.type || 'No type'}</p>
                          </div>
                        </div>
                      )}

                      {activeTab === 'rule' && (
                        <div className="flex items-start gap-3 p-3 bg-stone-800/50 hover:bg-stone-800 rounded-xl cursor-pointer transition-colors">
                          <div className="w-6 h-6 bg-amber-500/10 border border-amber-500/30 rounded flex items-center justify-center text-xs font-bold text-amber-400 flex-shrink-0">
                            {i + 1}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-stone-300">{el.name}</p>
                            {el.description && <p className="text-xs text-stone-500 mt-1 line-clamp-2">{el.description}</p>}
                          </div>
                        </div>
                      )}

                      {/* Delete confirmation overlay */}
                      {deleteElementConfirm === el.id && (
                        <div className="absolute inset-0 bg-stone-900/95 rounded-xl flex flex-col items-center justify-center gap-2 p-3 z-10">
                          <p className="text-xs text-rose-400">Delete this {activeTab}?</p>
                          <div className="flex gap-2">
                            <button
                              onClick={() => deleteStoryElement(el.id)}
                              className="text-xs bg-rose-500 hover:bg-rose-400 text-white px-2 py-1 rounded"
                            >
                              Delete
                            </button>
                            <button
                              onClick={() => setDeleteElementConfirm(null)}
                              className="text-xs bg-stone-700 hover:bg-stone-600 text-stone-300 px-2 py-1 rounded"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Hover delete button */}
                      <button
                        onClick={() => setDeleteElementConfirm(el.id)}
                        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 text-stone-500 hover:text-rose-400 transition-all z-0"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>

          {activeTab !== 'atlas' && (
            <div className="p-4 border-t border-stone-800">
              <p className="text-xs text-stone-500 text-center">
                Track the elements that make your world consistent and believable.
              </p>
            </div>
          )}
        </aside>
      )}

      {/* Add Element Modal */}
      {modalOpen && activeTab !== 'atlas' && (
        <AddElementModal
          category={activeTab as StoryElementCategory}
          onClose={() => setModalOpen(false)}
          onSave={addStoryElement}
          saving={elementSaving}
        />
      )}

      {/* Pin Link Modal */}
      {pinModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-stone-900 border border-stone-700 rounded-2xl shadow-2xl w-full max-w-sm mx-4 p-6">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <MapPinIcon className="w-4 h-4 text-amber-400" />
                <h3 className="text-sm font-semibold text-white">Drop a Pin</h3>
              </div>
              <button onClick={() => { setPinModalOpen(false); setPendingPin(null); }} className="text-stone-500 hover:text-white transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-stone-500 mb-4">Link this pin to a Location from your Story Bible (optional).</p>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium text-stone-400 mb-1 block">Location</label>
                <select
                  value={selectedLocationId}
                  onChange={e => setSelectedLocationId(e.target.value)}
                  className="w-full bg-stone-800 border border-stone-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
                >
                  <option value="">— No link (place pin only) —</option>
                  {locationElements.map(loc => (
                    <option key={loc.id} value={loc.id}>{loc.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex gap-2 mt-6">
              <button
                onClick={() => { setPinModalOpen(false); setPendingPin(null); }}
                className="flex-1 px-4 py-2 text-xs font-medium text-stone-400 hover:text-white bg-stone-800 hover:bg-stone-700 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={savePin}
                disabled={pinLinking}
                className="flex-1 px-4 py-2 text-xs font-semibold bg-amber-500 hover:bg-amber-400 text-stone-950 rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center gap-1.5"
              >
                {pinLinking ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <MapPinIcon className="w-3.5 h-3.5" />}
                Place Pin
              </button>
            </div>
          </div>
        </div>
      )}

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
