import { useState, useEffect } from 'react';
import { NavLink, useNavigate, Link } from 'react-router-dom';
import {
  BookOpen, LogOut, PenLine, BookMarked,
  Settings, Plus,
  ChevronRight, ChevronDown, FileText,
  PanelRightClose, PanelRight, Users as UsersIcon, MapPin, ScrollText,
  Trash2, Edit3, Menu, Home, Eye, Loader2, Save, LayoutGrid, X
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { supabase, BinderItem, StoryElement, StoryElementCategory } from '../../lib/supabase';

const navItems = [
  { icon: Home, label: 'Home', to: '/' },
  { icon: PenLine, label: 'Write', to: '/dashboard/writer' },
  { icon: Eye, label: 'Create Art', to: '/dashboard/artist' },
  { icon: BookMarked, label: 'Reading List', to: '/dashboard/reader' },
  { icon: LayoutGrid, label: 'Storyboard', to: '/storyboard' },
  { icon: Settings, label: 'Settings', to: '#' },
];

const bibleTabs: { id: StoryElementCategory; label: string; icon: typeof UsersIcon }[] = [
  { id: 'character', label: 'Characters', icon: UsersIcon },
  { id: 'location', label: 'Locations', icon: MapPin },
  { id: 'rule', label: 'World Rules', icon: ScrollText },
];

const characterColors = ['bg-amber-500', 'bg-sky-500', 'bg-rose-500', 'bg-emerald-500', 'bg-violet-500', 'bg-orange-500'];

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
  const [activeTab, setActiveTab] = useState<StoryElementCategory>('character');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [expandedDocs, setExpandedDocs] = useState<Set<string>>(new Set());
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const [showSaveIndicator, setShowSaveIndicator] = useState(false);

  // Story Bible state
  const [storyElements, setStoryElements] = useState<StoryElement[]>([]);
  const [bibleLoading, setBibleLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [elementSaving, setElementSaving] = useState(false);
  const [deleteElementConfirm, setDeleteElementConfirm] = useState<string | null>(null);

  // Fetch documents on mount
  useEffect(() => {
    if (user) {
      fetchDocuments();
      fetchStoryElements();
    }
  }, [user]);

  // Keyboard shortcut for save
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        if (activeDocument && !saving) {
          saveDocument();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeDocument, saving, editorContent, editorTitle]);

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

  const fetchDocuments = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('binder_items')
      .select('*')
      .eq('user_id', user?.id)
      .order('created_at', { ascending: true });

    if (!error && data) {
      setDocuments(data);
      if (data.length > 0 && !activeDocument) {
        setActiveDocument(data[0]);
        setEditorContent(data[0].content || '');
        setEditorTitle(data[0].title);
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
    const title = documents.length === 0
      ? 'Untitled Document'
      : `Chapter ${documents.filter(d => d.title.startsWith('Chapter')).length + 1}`;

    const { data, error } = await supabase
      .from('binder_items')
      .insert({ user_id: user?.id, title, content: '' })
      .select()
      .single();

    if (!error && data) {
      setDocuments([...documents, data]);
      setActiveDocument(data);
      setEditorContent('');
      setEditorTitle(data.title);
      setExpandedDocs(new Set([...expandedDocs, data.id]));
    }
  };

  const selectDocument = (doc: BinderItem) => {
    setActiveDocument(doc);
    setEditorContent(doc.content || '');
    setEditorTitle(doc.title);
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
    const { error } = await supabase
      .from('binder_items')
      .delete()
      .eq('id', docId);

    if (!error) {
      const updatedDocs = documents.filter(d => d.id !== docId);
      setDocuments(updatedDocs);
      setDeleteConfirm(null);
      if (activeDocument?.id === docId) {
        if (updatedDocs.length > 0) {
          selectDocument(updatedDocs[0]);
        } else {
          setActiveDocument(null);
          setEditorContent('');
          setEditorTitle('');
        }
      }
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

  const toggleExpand = (docId: string) => {
    const newExpanded = new Set(expandedDocs);
    if (newExpanded.has(docId)) newExpanded.delete(docId);
    else newExpanded.add(docId);
    setExpandedDocs(newExpanded);
  };

  const wordCount = editorContent.trim() ? editorContent.trim().split(/\s+/).length : 0;

  const filteredElements = storyElements.filter(el => el.category === activeTab);

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
        <h1 className="text-sm font-semibold tracking-wide">The Writer's Engine</h1>
        <button onClick={async () => { await signOut(); navigate('/'); }} className="text-stone-400">
          <LogOut className="w-5 h-5" />
        </button>
      </header>

      {/* THE BINDER - Left Sidebar */}
      <aside
        className={`${
          sidebarOpen ? 'w-64' : 'w-12'
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
                  <p className="text-xs text-stone-500">{documents.length} document{documents.length !== 1 ? 's' : ''}</p>
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
              ) : documents.length === 0 ? (
                <div className="text-center py-8">
                  <FileText className="w-8 h-8 text-stone-700 mx-auto mb-2" />
                  <p className="text-xs text-stone-500">No documents yet</p>
                  <p className="text-xs text-stone-600 mt-1">Click "Add Chapter" to begin</p>
                </div>
              ) : (
                documents.map((doc) => (
                  <div key={doc.id} className="select-none">
                    <div
                      className={`group flex items-center gap-2 px-2 py-1.5 rounded-lg cursor-pointer transition-colors ${
                        activeDocument?.id === doc.id ? 'bg-amber-500/10' : 'hover:bg-stone-800/50'
                      }`}
                      onClick={() => selectDocument(doc)}
                    >
                      {expandedDocs.has(doc.id) ? (
                        <ChevronDown className="w-3.5 h-3.5 text-stone-500 flex-shrink-0" onClick={(e) => { e.stopPropagation(); toggleExpand(doc.id); }} />
                      ) : (
                        <ChevronRight className="w-3.5 h-3.5 text-stone-500 flex-shrink-0" onClick={(e) => { e.stopPropagation(); toggleExpand(doc.id); }} />
                      )}
                      <FileText className="w-3.5 h-3.5 text-amber-500/60 flex-shrink-0" />
                      <span className={`text-xs truncate flex-1 ${activeDocument?.id === doc.id ? 'text-amber-400' : 'text-stone-300'}`}>
                        {doc.title}
                      </span>
                      <button
                        onClick={(e) => { e.stopPropagation(); setDeleteConfirm(doc.id); }}
                        className="opacity-0 group-hover:opacity-100 text-stone-500 hover:text-rose-400 transition-all"
                        title="Delete"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {expandedDocs.has(doc.id) && (
                      <div className="ml-6 mt-1 px-2 py-2">
                        <p className="text-xs text-stone-500 line-clamp-2">
                          {doc.content ? doc.content.slice(0, 100) + '...' : 'Empty document'}
                        </p>
                        <p className="text-xs text-stone-600 mt-1">
                          {doc.content ? `${doc.content.trim().split(/\s+/).length} words` : '0 words'}
                        </p>
                      </div>
                    )}

                    {deleteConfirm === doc.id && (
                      <div className="ml-6 mt-1 p-2 bg-rose-500/10 border border-rose-500/30 rounded-lg">
                        <p className="text-xs text-rose-400 mb-2">Delete this document?</p>
                        <div className="flex gap-2">
                          <button onClick={() => deleteDocument(doc.id)} className="text-xs bg-rose-500 hover:bg-rose-400 text-white px-2 py-1 rounded">Delete</button>
                          <button onClick={() => setDeleteConfirm(null)} className="text-xs bg-stone-700 hover:bg-stone-600 text-stone-300 px-2 py-1 rounded">Cancel</button>
                        </div>
                      </div>
                    )}
                  </div>
                ))
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
          {activeDocument ? (
            <div className="w-full h-full flex flex-col">
              <textarea
                value={editorContent}
                onChange={(e) => setEditorContent(e.target.value)}
                className="editor-textarea flex-1 focus:outline-none"
                placeholder="Begin your story here... The cursor blinks, waiting for your first words."
              />
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

          <div className="flex-1 overflow-y-auto p-4">
            {bibleLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-5 h-5 text-stone-500 animate-spin" />
              </div>
            ) : (
              <div className="space-y-3">
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
                            <MapPin className="w-4 h-4 text-stone-400" />
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

          <div className="p-4 border-t border-stone-800">
            <p className="text-xs text-stone-500 text-center">
              Track the elements that make your world consistent and believable.
            </p>
          </div>
        </aside>
      )}

      {/* Add Element Modal */}
      {modalOpen && (
        <AddElementModal
          category={activeTab}
          onClose={() => setModalOpen(false)}
          onSave={addStoryElement}
          saving={elementSaving}
        />
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
