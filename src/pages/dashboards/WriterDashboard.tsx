import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Feather, BookOpen, LogOut, PenLine, BookMarked,
  BarChart2, Settings, Users, TrendingUp, Plus,
  ChevronRight, ChevronDown, FileText, MoreHorizontal,
  PanelRightClose, PanelRight, Users as UsersIcon, MapPin, ScrollText,
  GripVertical, Trash2, Edit3, Menu
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface Scene {
  id: string;
  title: string;
}

interface Chapter {
  id: string;
  title: string;
  expanded: boolean;
  scenes: Scene[];
}

// Mock data for UI skeleton
const mockChapters: Chapter[] = [
  { id: '1', title: 'Chapter 1: The Beginning', expanded: true, scenes: [
    { id: '1-1', title: 'Scene 1: A Stranger Arrives' },
    { id: '1-2', title: 'Scene 2: The Old Tavern' },
  ]},
  { id: '2', title: 'Chapter 2: Into the Forest', expanded: false, scenes: [
    { id: '2-1', title: 'Scene 1: Dark Paths' },
  ]},
  { id: '3', title: 'Chapter 3: Revelations', expanded: false, scenes: [] },
];

const navItems = [
  { icon: PenLine, label: 'Write', active: true },
  { icon: BookMarked, label: 'My Stories' },
  { icon: BarChart2, label: 'Analytics' },
  { icon: Users, label: 'Community' },
  { icon: Settings, label: 'Settings' },
];

const bibleTabs = [
  { id: 'characters', label: 'Characters', icon: UsersIcon },
  { id: 'locations', label: 'Locations', icon: MapPin },
  { id: 'rules', label: 'World Rules', icon: ScrollText },
];

const mockCharacters = [
  { id: '1', name: 'Elena Vance', role: 'Protagonist', color: 'bg-amber-500' },
  { id: '2', name: 'Marcus Cole', role: 'Mentor', color: 'bg-sky-500' },
  { id: '3', name: 'The Shadow', role: 'Antagonist', color: 'bg-rose-500' },
];

const mockLocations = [
  { id: '1', name: 'Thornwood Village', type: 'Settlement' },
  { id: '2', name: 'The Whispering Forest', type: 'Wilderness' },
  { id: '3', name: 'Castle Blackmoor', type: 'Stronghold' },
];

const mockRules = [
  { id: '1', rule: 'Magic requires a cost — always.' },
  { id: '2', rule: 'The dead do not return unchanged.' },
  { id: '3', rule: 'Shadows remember what light forgets.' },
];

export default function WriterDashboard() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [chapters, setChapters] = useState<Chapter[]>(mockChapters);
  const [activeScene, setActiveScene] = useState<string | null>('1-1');
  const [bibleOpen, setBibleOpen] = useState(true);
  const [activeTab, setActiveTab] = useState('characters');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toggleChapter = (chapterId: string) => {
    setChapters(chapters.map(ch =>
      ch.id === chapterId ? { ...ch, expanded: !ch.expanded } : ch
    ));
  };

  const addChapter = () => {
    const newId = String(Date.now());
    setChapters([...chapters, {
      id: newId,
      title: `Chapter ${chapters.length + 1}: Untitled`,
      expanded: true,
      scenes: []
    }]);
  };

  const addScene = (chapterId: string) => {
    setChapters(chapters.map(ch => {
      if (ch.id === chapterId) {
        const newId = `${chapterId}-${Date.now()}`;
        return {
          ...ch,
          scenes: [...ch.scenes, { id: newId, title: `Scene ${ch.scenes.length + 1}` }]
        };
      }
      return ch;
    }));
  };

  return (
    <div className="min-h-screen bg-stone-950 text-white flex overflow-hidden">
      {/* Left Navigation Rail */}
      <aside className="hidden md:flex w-16 bg-stone-900 border-r border-stone-800 flex-col items-center py-6 gap-2">
        <div className="mb-4">
          <BookOpen className="w-6 h-6 text-amber-500" />
        </div>
        <div className="flex-1 flex flex-col gap-1">
          {navItems.map((item, i) => (
            <button
              key={item.label}
              className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors ${
                i === 0 ? 'bg-amber-500/10 text-amber-400' : 'text-stone-500 hover:text-white hover:bg-stone-800'
              }`}
              title={item.label}
            >
              <item.icon className="w-5 h-5" />
            </button>
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
          <BookOpen className="w-5 h-5 text-amber-500" />
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
                  <p className="text-xs text-stone-500">3 chapters</p>
                </div>
              </div>
              <button
                onClick={() => setSidebarOpen(false)}
                className="text-stone-500 hover:text-white transition-colors"
              >
                <PanelRightClose className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-3 space-y-1">
              {chapters.map((chapter) => (
                <div key={chapter.id} className="select-none">
                  {/* Chapter Header */}
                  <div
                    className="group flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-stone-800/50 cursor-pointer transition-colors"
                    onClick={() => toggleChapter(chapter.id)}
                  >
                    {chapter.expanded ? (
                      <ChevronDown className="w-3.5 h-3.5 text-stone-500 flex-shrink-0" />
                    ) : (
                      <ChevronRight className="w-3.5 h-3.5 text-stone-500 flex-shrink-0" />
                    )}
                    <FileText className="w-3.5 h-3.5 text-amber-500/60 flex-shrink-0" />
                    <span className="text-xs text-stone-300 truncate flex-1">{chapter.title}</span>
                    <button
                      onClick={(e) => { e.stopPropagation(); addScene(chapter.id); }}
                      className="opacity-0 group-hover:opacity-100 text-stone-500 hover:text-amber-400 transition-all"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={(e) => e.stopPropagation()}
                      className="opacity-0 group-hover:opacity-100 text-stone-500 hover:text-white transition-all"
                    >
                      <MoreHorizontal className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Scenes */}
                  {chapter.expanded && (
                    <div className="ml-6 mt-1 space-y-0.5">
                      {chapter.scenes.map((scene) => (
                        <div
                          key={scene.id}
                          onClick={() => setActiveScene(scene.id)}
                          className={`group flex items-center gap-2 px-2 py-1.5 rounded cursor-pointer transition-colors ${
                            activeScene === scene.id
                              ? 'bg-amber-500/10 text-amber-400'
                              : 'hover:bg-stone-800/50 text-stone-400'
                          }`}
                        >
                          <GripVertical className="w-3 h-3 text-stone-600 opacity-0 group-hover:opacity-100" />
                          <span className="text-xs truncate">{scene.title}</span>
                        </div>
                      ))}
                      {chapter.scenes.length === 0 && (
                        <p className="text-xs text-stone-600 px-2 py-1 italic">No scenes</p>
                      )}
                    </div>
                  )}
                </div>
              ))}
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
          <button
            onClick={() => setSidebarOpen(true)}
            className="w-12 h-12 flex items-center justify-center text-stone-500 hover:text-white transition-colors"
          >
            <PanelRight className="w-4 h-4" />
          </button>
        )}
      </aside>

      {/* THE EDITOR - Center */}
      <main className="flex-1 flex flex-col min-w-0 pt-14 md:pt-0">
        {/* Editor Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-800 bg-stone-900/30">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-amber-500" />
              <div className="w-3 h-3 rounded-full bg-stone-600" />
              <div className="w-3 h-3 rounded-full bg-stone-600" />
            </div>
            <span className="text-xs text-stone-500">Scene 1: A Stranger Arrives</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-stone-600">2,847 words</span>
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

        {/* Editor Canvas */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-3xl mx-auto px-8 py-12">
            <div
              className="prose prose-invert prose-stone max-w-none min-h-[60vh] outline-none"
              contentEditable
              suppressContentEditableWarning
              data-placeholder="Begin your story here... The cursor blinks, waiting for your first words."
            >
              <p className="text-stone-300 leading-relaxed">
                The rain had been falling for three days when the stranger arrived at Thornwood Village.
                Elena watched from the tavern window as the figure emerged from the mist, cloak pulled
                tight against the wind. There was something unsettling about the way they moved —
                deliberate, unafraid, as if the storm itself had yielded to let them pass.
              </p>
              <p className="text-stone-300 leading-relaxed mt-4">
                <span className="text-amber-400/60">[Continue writing...]</span>
              </p>
            </div>
          </div>
        </div>

        {/* Editor Footer */}
        <div className="flex items-center justify-between px-6 py-3 border-t border-stone-800 bg-stone-900/30">
          <div className="flex items-center gap-4 text-xs text-stone-500">
            <span>Chapter 1</span>
            <span className="w-px h-3 bg-stone-700" />
            <span>Scene 1 of 2</span>
            <span className="w-px h-3 bg-stone-700" />
            <span>Untitled Story</span>
          </div>
          <div className="flex items-center gap-2">
            <button className="text-stone-500 hover:text-white text-xs px-3 py-1.5 rounded hover:bg-stone-800 transition-colors">
              Preview
            </button>
            <button className="bg-amber-500 hover:bg-amber-400 text-stone-950 text-xs font-semibold px-4 py-1.5 rounded transition-colors">
              Save Changes
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
            {activeTab === 'characters' && (
              <div className="space-y-3">
                <button className="w-full flex items-center gap-2 text-stone-400 hover:text-white text-xs py-2 transition-colors">
                  <Plus className="w-4 h-4" />
                  Add Character
                </button>
                {mockCharacters.map((char) => (
                  <div
                    key={char.id}
                    className="group flex items-center gap-3 p-3 bg-stone-800/50 hover:bg-stone-800 rounded-xl cursor-pointer transition-colors"
                  >
                    <div className={`w-10 h-10 ${char.color} rounded-full flex items-center justify-center text-white text-sm font-bold`}>
                      {char.name[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white truncate">{char.name}</p>
                      <p className="text-xs text-stone-500">{char.role}</p>
                    </div>
                    <button className="opacity-0 group-hover:opacity-100 text-stone-500 hover:text-white transition-all">
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'locations' && (
              <div className="space-y-3">
                <button className="w-full flex items-center gap-2 text-stone-400 hover:text-white text-xs py-2 transition-colors">
                  <Plus className="w-4 h-4" />
                  Add Location
                </button>
                {mockLocations.map((loc) => (
                  <div
                    key={loc.id}
                    className="group flex items-center gap-3 p-3 bg-stone-800/50 hover:bg-stone-800 rounded-xl cursor-pointer transition-colors"
                  >
                    <div className="w-10 h-10 bg-stone-700 rounded-lg flex items-center justify-center">
                      <MapPin className="w-4 h-4 text-stone-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white truncate">{loc.name}</p>
                      <p className="text-xs text-stone-500">{loc.type}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'rules' && (
              <div className="space-y-3">
                <button className="w-full flex items-center gap-2 text-stone-400 hover:text-white text-xs py-2 transition-colors">
                  <Plus className="w-4 h-4" />
                  Add Rule
                </button>
                {mockRules.map((r, i) => (
                  <div
                    key={r.id}
                    className="group flex items-start gap-3 p-3 bg-stone-800/50 hover:bg-stone-800 rounded-xl cursor-pointer transition-colors"
                  >
                    <div className="w-6 h-6 bg-amber-500/10 border border-amber-500/30 rounded flex items-center justify-center text-xs font-bold text-amber-400">
                      {i + 1}
                    </div>
                    <p className="flex-1 text-sm text-stone-300">{r.rule}</p>
                    <button className="opacity-0 group-hover:opacity-100 text-stone-500 hover:text-rose-400 transition-all">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
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

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-50 bg-stone-950/95 flex flex-col pt-14">
          <div className="flex-1 p-6 space-y-4">
            {navItems.map((item) => (
              <button
                key={item.label}
                className="w-full flex items-center gap-3 px-4 py-3 text-stone-400 hover:text-white hover:bg-stone-800 rounded-xl transition-colors"
              >
                <item.icon className="w-5 h-5" />
                <span className="text-sm font-medium">{item.label}</span>
              </button>
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
