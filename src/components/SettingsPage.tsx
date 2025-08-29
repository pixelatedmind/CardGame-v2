import React, { useState, useEffect } from 'react';
import { Settings, X, Plus, Minus, Save } from 'lucide-react';

interface SettingsPageProps {
  isOpen: boolean;
  onClose: () => void;
  onWordsUpdate: (newWords: Record<string, string[]>) => void;
  defaultWords: Record<string, string[]>;
  currentWords: Record<string, string[]>;
}

interface WordEntry {
  id: string;
  word: string;
  category: 'future' | 'thing' | 'theme';
}

const SettingsPage: React.FC<SettingsPageProps> = ({ 
  isOpen, 
  onClose, 
  onWordsUpdate, 
  currentWords 
}) => {
  const [wordEntries, setWordEntries] = useState<WordEntry[]>([]);
  const [newWord, setNewWord] = useState('');
  const [newCategory, setNewCategory] = useState<'future' | 'thing' | 'theme'>('future');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Convert current words to editable format
  useEffect(() => {
    if (isOpen) {
      const entries: WordEntry[] = [];
      Object.entries(currentWords).forEach(([category, words]) => {
        words.forEach((word, index) => {
          entries.push({
            id: `${category}-${index}`,
            word,
            category: category as 'future' | 'thing' | 'theme'
          });
        });
      });
      setWordEntries(entries);
      setHasUnsavedChanges(false);
    }
  }, [isOpen, currentWords]);

  const addWord = () => {
    if (newWord.trim()) {
      const newEntry: WordEntry = {
        id: `${newCategory}-${Date.now()}`,
        word: newWord.trim().toUpperCase(),
        category: newCategory
      };
      setWordEntries(prev => [...prev, newEntry]);
      setNewWord('');
      setHasUnsavedChanges(true);
    }
  };

  const removeWord = (id: string) => {
    setWordEntries(prev => prev.filter(entry => entry.id !== id));
    setHasUnsavedChanges(true);
  };

  const updateWord = (id: string, newWord: string) => {
    setWordEntries(prev => prev.map(entry => 
      entry.id === id ? { ...entry, word: newWord.toUpperCase() } : entry
    ));
    setHasUnsavedChanges(true);
  };

  const saveChanges = () => {
    const newWordsData: Record<string, string[]> = {
      future: [],
      thing: [],
      theme: []
    };

    wordEntries.forEach(entry => {
      newWordsData[entry.category].push(entry.word);
    });

    onWordsUpdate(newWordsData);
    setHasUnsavedChanges(false);
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'future': return 'bg-green-100 text-green-800 border-green-200';
      case 'thing': return 'bg-red-100 text-red-800 border-red-200';
      case 'theme': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getCategoryStats = () => {
    const stats = { future: 0, thing: 0, theme: 0 };
    wordEntries.forEach(entry => {
      stats[entry.category]++;
    });
    return stats;
  };

  if (!isOpen) return null;

  const stats = getCategoryStats();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-indigo-50 to-purple-50">
          <div className="flex items-center gap-3">
            <Settings className="w-6 h-6 text-indigo-600" />
            <h2 className="text-2xl font-bold text-gray-800">Settings</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <div className="flex items-center gap-2 px-6 py-4 font-medium text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50">
            <Settings className="w-4 h-4" />
            Word Management
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          <div className="space-y-6">
            {/* Stats */}
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-green-600">{stats.future}</div>
                <div className="text-sm text-green-700">Future Words</div>
              </div>
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-red-600">{stats.thing}</div>
                <div className="text-sm text-red-700">Thing Words</div>
              </div>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-blue-600">{stats.theme}</div>
                <div className="text-sm text-blue-700">Theme Words</div>
              </div>
            </div>

            {/* Add New Word */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-800 mb-3">Add New Word</h3>
              <div className="flex gap-3">
                <input
                  type="text"
                  value={newWord}
                  onChange={(e) => setNewWord(e.target.value)}
                  placeholder="Enter new word..."
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  onKeyPress={(e) => e.key === 'Enter' && addWord()}
                />
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value as any)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="future">Future</option>
                  <option value="thing">Thing</option>
                  <option value="theme">Theme</option>
                </select>
                <button
                  onClick={addWord}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Add
                </button>
              </div>
            </div>

            {/* Word List */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-800">Current Words</h3>
              <div className="grid gap-2 max-h-80 overflow-y-auto">
                {wordEntries.map((entry) => (
                  <div key={entry.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <span className={`px-2 py-1 rounded text-xs font-medium border ${getCategoryColor(entry.category)}`}>
                      {entry.category}
                    </span>
                    <input
                      type="text"
                      value={entry.word}
                      onChange={(e) => updateWord(entry.id, e.target.value)}
                      className="flex-1 px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                    <button
                      onClick={() => removeWord(entry.id)}
                      className="p-1 text-red-500 hover:bg-red-100 rounded transition-colors"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center gap-2">
            {hasUnsavedChanges && (
              <span className="text-sm text-amber-600 flex items-center gap-1">
                <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                Unsaved changes
              </span>
            )}
          </div>
          
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              Cancel
            </button>
            {hasUnsavedChanges && (
              <button
                onClick={saveChanges}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
              >
                <Save className="w-4 h-4" />
                Save Changes
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;