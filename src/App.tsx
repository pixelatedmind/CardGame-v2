import React, { useState, useCallback, useEffect } from 'react';
import { RefreshCw, History, Zap, Settings, Share2 } from 'lucide-react';
import SettingsPage from './components/SettingsPage';
import ShareModal from './components/ShareModal';

// Helper function to get dynamic text size based on word length
const getDynamicTextSize = (word: string) => {
  const length = word.length;
  if (length > 20) {
    return 'text-[18px] sm:text-[20px] md:text-[22px] lg:text-[28px]';
  } else if (length > 15) {
    return 'text-[22px] sm:text-[24px] md:text-[26px] lg:text-[32px]';
  } else if (length > 10) {
    return 'text-[26px] sm:text-[28px] md:text-[30px] lg:text-[36px]';
  } else {
    return 'text-[30px] sm:text-[32px] md:text-[34px] lg:text-[40px]';
  }
};

// Types
interface WordCategory {
  id: string;
  label: string;
  description: string;
  words: string[];
}

// Parse JSON function
const parseJSON = (jsonData: any[]): Record<string, string[]> => {
  console.log('Parsing JSON...');
  console.log('JSON data length:', jsonData.length);
  
  if (!Array.isArray(jsonData) || jsonData.length === 0) {
    console.error('Invalid JSON data - expected non-empty array');
    return {};
  }
  
  const categories: Record<string, string[]> = {};
  
  jsonData.forEach((item, index) => {
    if (!item.Word || !item.Category) {
      console.warn(`Item ${index} missing Word or Category:`, item);
      return;
    }
    
    const category = item.Category.toLowerCase();
    const word = item.Word.toUpperCase();
    
    // Only accept valid categories
    if (!['future', 'thing', 'theme'].includes(category)) {
      console.warn(`Item ${index} has invalid category:`, category);
      return;
    }
    
    if (!categories[category]) {
      categories[category] = [];
    }
    categories[category].push(word);
  });
  
  console.log('Final parsed categories:', categories);
  console.log('Category counts:', Object.keys(categories).map(key => `${key}: ${categories[key].length}`));
  return categories;
};

function App() {
  const [wordCategories, setWordCategories] = useState<Record<string, WordCategory>>({});
  const [defaultWordsData, setDefaultWordsData] = useState<Record<string, string[]>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [currentWords, setCurrentWords] = useState({
    future: 'Loading...',
    thing: 'Loading...',
    theme: 'Loading...'
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [showPastPrompts, setShowPastPrompts] = useState(false);
  const [pastPrompts, setPastPrompts] = useState<Array<{
    id: string;
    future: string;
    thing: string;
    theme: string;
    timestamp: Date;
  }>>([]);
  const [isAnimating, setIsAnimating] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [shownWords, setShownWords] = useState<Record<string, string[]>>({
    future: [],
    thing: [],
    theme: []
  });

  // Load words from CSV data
  useEffect(() => {
    const loadWords = async () => {
      console.log('Starting to load words from public/Things-DB-app.json...');
      try {
        const response = await fetch('/Things-DB-app.json');
        
        if (!response.ok) {
          throw new Error(`Failed to fetch JSON file: ${response.status} ${response.statusText}`);
        }
        
        const jsonData = await response.json();
        console.log('JSON data loaded, items count:', jsonData.length);
        
        if (!jsonData || jsonData.length === 0) {
          throw new Error('Empty JSON response');
        }
        
        const parsedCategories = parseJSON(jsonData);
        console.log('Parsed categories:', parsedCategories);
        
        if (Object.keys(parsedCategories).length === 0) {
          throw new Error('No categories parsed from JSON');
        }
        
        // Store default words data
        setDefaultWordsData(parsedCategories);
        
        const categories: Record<string, WordCategory> = {
          future: {
            id: 'future',
            label: 'Energy Future',
            description: 'In a [WORD] energy future',
            words: parsedCategories.future || []
          },
          thing: {
            id: 'thing',
            label: 'Solution',
            description: 'There is a [WORD]',
            words: parsedCategories.thing || []
          },
          theme: {
            id: 'theme',
            label: 'Focus Area',
            description: 'Related to [WORD]',
            words: parsedCategories.theme || []
          }
        };
        
        // Validate that we have words for each category
        Object.keys(categories).forEach(key => {
          console.log(`Category ${key} has ${categories[key].words.length} words`);
        });
        
        setWordCategories(categories);
        console.log('Word categories set successfully');
        setIsLoading(false);
        
        // Generate random initial words
        const initialWords = {
          future: categories.future.words[Math.floor(Math.random() * categories.future.words.length)],
          thing: categories.thing.words[Math.floor(Math.random() * categories.thing.words.length)],
          theme: categories.theme.words[Math.floor(Math.random() * categories.theme.words.length)]
        };
        setCurrentWords(initialWords);
        
        // Initialize shown words with the initial words
        setShownWords({
          future: [initialWords.future],
          thing: [initialWords.thing],
          theme: [initialWords.theme]
        });
      } catch (error) {
        console.error('Error loading words:', error);
        setIsLoading(false);
      }
    };
    
    loadWords();
  }, []);


  const getRandomWord = useCallback((category: keyof typeof wordCategories, excludedWords: string[] = []): string => {
    const words = wordCategories[category]?.words || [];
    console.log(`Getting random word for category ${category}, available words:`, words.length);
    if (words.length === 0) return 'Loading...';
    
    // Filter out excluded words
    const availableWords = words.filter(word => !excludedWords.includes(word));
    
    // If no words available after filtering, fall back to full list (reset cycle)
    const wordsToUse = availableWords.length > 0 ? availableWords : words;
    
    const randomIndex = Math.floor(Math.random() * wordsToUse.length);
    const selectedWord = wordsToUse[randomIndex];
    console.log(`Selected word for ${category}:`, selectedWord);
    return selectedWord;
  }, [wordCategories]);

  const generateWord = useCallback(async (category: keyof typeof wordCategories) => {
    setIsGenerating(true);
    
    // Add slight delay for better UX
    await new Promise(resolve => setTimeout(resolve, 75));
    
    const currentShownWords = shownWords[category];
    const newWord = getRandomWord(category, currentShownWords);
    
    setCurrentWords(prev => ({
      ...prev,
      [category]: newWord
    }));
    
    // Update shown words for this category
    setShownWords(prev => {
      const updated = { ...prev };
      const wasAlreadyShown = prev[category].includes(newWord);
      updated[category] = wasAlreadyShown ? [newWord] : [...prev[category], newWord];
      return updated;
    });
    
    setIsGenerating(false);
  }, [getRandomWord, shownWords]);

  const generateAllWords = useCallback(async () => {
    // Start animation
    setIsAnimating(true);
    
    // Wait for animation to complete (0.75 seconds)
    await new Promise(resolve => setTimeout(resolve, 375));
    
    setIsGenerating(true);

    // Add small delay after button animation ends
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Generate new words excluding currently shown ones
    const newWords = {
      future: getRandomWord('future', shownWords.future),
      thing: getRandomWord('thing', shownWords.thing),
      theme: getRandomWord('theme', shownWords.theme)
    };

    setCurrentWords(newWords);
    
    // Update shown words for each category
    setShownWords(prev => {
      const updated = { ...prev };
      Object.keys(newWords).forEach(category => {
        const cat = category as keyof typeof newWords;
        const newWord = newWords[cat];
        const currentShownForCategory = prev[cat];
        const wasAlreadyShown = currentShownForCategory.includes(newWord);
        updated[cat] = wasAlreadyShown ? [newWord] : [...currentShownForCategory, newWord];
      });
      return updated;
    });
    
    setIsGenerating(false);
    
    // Add to past prompts if all words are valid
    if (newWords.future && newWords.thing && newWords.theme) {
      const newPrompt = {
        id: Date.now().toString(),
        future: newWords.future,
        thing: newWords.thing,
        theme: newWords.theme,
        timestamp: new Date()
      };
      setPastPrompts(prev => [newPrompt, ...prev.slice(0, 9)]); // Keep last 10
    }
    
    // Stop animation immediately after words appear
    setTimeout(() => {
      setIsAnimating(false);
    }, 100);
  }, [getRandomWord, shownWords]);

  const handleWordsUpdate = useCallback((updatedWords: {
    future: string[];
    thing: string[];
    theme: string[];
  }) => {
    const updatedCategories = {
      future: {
        id: 'future',
        label: 'Energy Future',
        description: 'In a [WORD] energy future',
        words: updatedWords.future
      },
      thing: {
        id: 'thing',
        label: 'Solution',
        description: 'There is a [WORD]',
        words: updatedWords.thing
      },
      theme: {
        id: 'theme',
        label: 'Focus Area',
        description: 'Related to [WORD]',
        words: updatedWords.theme
      }
    };
    
    setWordCategories(updatedCategories);
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 text-indigo-600 animate-spin mx-auto mb-4" />
          <p className="text-lg text-gray-600">Loading words...</p>
          <p className="text-sm text-gray-500 mt-2">Check console for details</p>
        </div>
      </div>
    );
  }
  
  // Show error state if no categories loaded
  if (Object.keys(wordCategories).length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 mb-4">
            <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <p className="text-lg text-gray-600 mb-2">Failed to load words</p>
          <p className="text-sm text-gray-500 mb-4">Check console for error details</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen paper-bg p-1 sm:p-4 lg:p-8 relative">
      
      {/* Share Button - Fixed Position */}
      <button
        onClick={() => setShowShareModal(true)}
        className="fixed top-4 left-4 z-40 bg-white hover:bg-gray-50 text-gray-700 p-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 border border-gray-200"
      >
        <Share2 className="w-5 h-5" />
      </button>

      {/* Settings Button - Fixed Position */}
      <button
        onClick={() => setShowSettings(true)}
        className="fixed top-4 right-4 z-40 bg-white hover:bg-gray-50 text-gray-700 p-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 border border-gray-200"
      >
        <Settings className="w-5 h-5" />
      </button>

      <div className="max-w-6xl mx-auto">
        <div className="relative z-10">
        
        {/* Logo Header */}
        <div className="text-center mb-4 sm:mb-8 p-4 sm:p-6">
          <div 
            className="flex items-center justify-center gap-2 sm:gap-3 mb-1"
          >
            <Zap className="w-6 sm:w-8 h-6 sm:h-8 text-amber-600" />
            <h1 className="text-xl sm:text-4xl font-bold text-black">
              Things from the future
            </h1>
            <Zap className="w-6 sm:w-8 h-6 sm:h-8 text-orange-600" />
          </div>
          
        </div>
        
        {/* Main Card Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 mb-4 sm:mb-8 landscape:grid-cols-3 landscape:gap-3">
          
          {/* Left Card - Future */}
          <div className="bg-gradient-to-br from-green-400 to-green-500 rounded-xl sm:rounded-3xl p-2 sm:p-4 text-white shadow-2xl relative">
            {/* Refresh Icon */}
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                generateWord('future');
              }}
              className="absolute top-3 right-3 z-10 p-3 text-white bg-black/20 hover:bg-black/40 hover:scale-125 rounded-full transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-white/70 shadow-lg hover:shadow-2xl cursor-pointer"
              title="Generate new future word"
            >
              <RefreshCw className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
            <div className="h-full flex flex-col min-h-[160px] sm:min-h-[250px] md:min-h-[350px] lg:min-h-[600px] xl:min-h-[700px] landscape:min-h-[140px] text-center">
              <div className="flex-1 flex flex-col">
                <div className="text-2xl sm:text-3xl md:text-3xl lg:text-8xl xl:text-12xl landscape:text-2xl font-medium opacity-90 mb-2 sm:mb-4 md:mb-4 lg:mb-8 landscape:mb-1">In a</div>
                <div className="bg-white rounded-lg sm:rounded-2xl py-2 px-1 sm:py-4 sm:px-2 md:py-3 md:px-1 lg:py-6 lg:px-3 flex-1 flex items-center justify-center landscape:py-3 landscape:px-1 shadow-lg mb-2 sm:mb-6 md:mb-4 lg:mb-16 landscape:mb-2 mt-2 sm:mt-6 md:mt-4 lg:mt-16 landscape:mt-2">
                  <div className={`${getDynamicTextSize(currentWords.future)} font-bold text-green-500 leading-tight break-words`}>
                    {currentWords.future}
                  </div>
                </div>
                <div className="text-2xl sm:text-3xl md:text-3xl lg:text-8xl xl:text-12xl landscape:text-2xl font-medium opacity-90">future</div>
              </div>
            </div>
          </div>

          {/* Middle Card - Thing */}
          <div className="bg-gradient-to-br from-red-400 to-red-500 rounded-xl sm:rounded-3xl p-2 sm:p-4 text-white shadow-2xl relative">
            {/* Refresh Icon */}
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                generateWord('thing');
              }}
              className="absolute top-3 right-3 z-10 p-3 text-white bg-black/20 hover:bg-black/40 hover:scale-125 rounded-full transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-white/70 shadow-lg hover:shadow-2xl cursor-pointer"
              title="Generate new thing word"
            >
              <RefreshCw className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
            <div className="h-full flex flex-col min-h-[160px] sm:min-h-[250px] md:min-h-[350px] lg:min-h-[600px] xl:min-h-[700px] landscape:min-h-[140px] text-center">
              <div className="flex-1 flex flex-col">
                <div className="text-2xl sm:text-3xl md:text-3xl lg:text-8xl xl:text-12xl landscape:text-2xl font-medium opacity-90 mb-2 sm:mb-4 md:mb-4 lg:mb-8 landscape:mb-1">there is a</div>
                <div className="bg-white rounded-lg sm:rounded-2xl py-2 px-1 sm:py-4 sm:px-2 md:py-3 md:px-1 lg:py-6 lg:px-3 flex-1 flex items-center justify-center landscape:py-3 landscape:px-1 shadow-lg mb-2 sm:mb-6 md:mb-4 lg:mb-16 landscape:mb-2 mt-2 sm:mt-6 md:mt-4 lg:mt-16 landscape:mt-2">
                  <div className={`${getDynamicTextSize(currentWords.thing)} font-bold text-red-500 leading-tight break-words`}>
                    {currentWords.thing}
                  </div>
                </div>
                <div className="text-2xl sm:text-3xl md:text-3xl lg:text-8xl xl:text-12xl landscape:text-2xl font-medium opacity-90 invisible">placeholder</div>
              </div>
            </div>
          </div>

          {/* Right Card - Theme */}
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl sm:rounded-3xl p-2 sm:p-4 text-white shadow-2xl relative">
            {/* Refresh Icon */}
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                generateWord('theme');
              }}
              className="absolute top-3 right-3 z-10 p-3 text-white bg-black/20 hover:bg-black/40 hover:scale-125 rounded-full transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-white/70 shadow-lg hover:shadow-2xl cursor-pointer"
              title="Generate new theme word"
            >
              <RefreshCw className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
            <div className="h-full flex flex-col min-h-[160px] sm:min-h-[250px] md:min-h-[350px] lg:min-h-[600px] xl:min-h-[700px] landscape:min-h-[140px] text-center">
              <div className="flex-1 flex flex-col">
                <div className="text-2xl sm:text-3xl md:text-3xl lg:text-8xl xl:text-12xl landscape:text-2xl font-medium opacity-90 mb-2 sm:mb-4 md:mb-4 lg:mb-8 landscape:mb-1">related to</div>
                <div className="bg-white rounded-lg sm:rounded-2xl py-2 px-1 sm:py-4 sm:px-2 md:py-3 md:px-1 lg:py-6 lg:px-3 flex-1 flex items-center justify-center landscape:py-3 landscape:px-1 shadow-lg mb-2 sm:mb-6 md:mb-4 lg:mb-16 landscape:mb-2 mt-2 sm:mt-6 md:mt-4 lg:mt-16 landscape:mt-2">
                  <div className={`${getDynamicTextSize(currentWords.theme)} font-bold text-blue-500 leading-tight break-words ${isAnimating ? 'animate-pop-in' : ''}`}>
                    {currentWords.theme}
                  </div>
                </div>
                <div className="text-2xl sm:text-3xl md:text-3xl lg:text-8xl xl:text-12xl landscape:text-2xl font-medium opacity-90">what is it?</div>
              </div>
            </div>
          </div>

        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 justify-center items-center mb-4 sm:mb-8 landscape:flex-row landscape:gap-2 px-4">
          {/* Generate Button - Only shown on larger screens */}
          <button
            onClick={generateAllWords}
            disabled={isGenerating}
            className={`hidden lg:flex rainbow-btn ${isAnimating ? 'animating' : ''} disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none text-sm sm:text-base landscape:text-sm`}
            style={{ height: '60px', minWidth: '180px' }}
          >
            <span className="px-6 sm:px-8 py-3 sm:py-4 landscape:px-3 landscape:py-2">
              <RefreshCw className={`w-4 sm:w-5 h-4 sm:h-5 ${isGenerating ? 'animate-spin' : ''} inline mr-2`} />
              Generate
            </span>
          </button>
          
          <button
            onClick={() => setShowPastPrompts(!showPastPrompts)}
            className="bg-white hover:bg-gray-50 text-gray-700 px-6 sm:px-8 py-3 sm:py-4 rounded-lg sm:rounded-xl font-semibold transition-all duration-300 flex items-center gap-2 sm:gap-3 shadow-lg hover:shadow-xl transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 border border-gray-200 text-sm sm:text-base landscape:px-3 landscape:py-2 landscape:text-sm"
          >
            <History className="w-4 sm:w-5 h-4 sm:h-5" />
            {showPastPrompts ? 'Hide History' : 'Past Prompts'}
          </button>
        </div>

        {/* Past Prompts Box */}
        {showPastPrompts && (
          <div className="bg-white rounded-3xl shadow-xl border border-gray-200 overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-800 flex items-center gap-3">
                <History className="w-5 h-5 text-amber-600" />
                Past Prompts
              </h2>
            </div>
            
            <div className="p-6">
              {pastPrompts.length === 0 ? (
                <div className="text-center py-8">
                  <History className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <h3 className="text-lg font-semibold text-gray-600 mb-2">No Past Prompts Yet</h3>
                  <p className="text-gray-500">Generate some prompts to see your history here!</p>
                </div>
              ) : (
                <div className="grid gap-3 max-h-80 overflow-y-auto">
                  {pastPrompts.map((prompt) => (
                    <div 
                      key={prompt.id} 
                      className="bg-gray-50 rounded-xl p-4 hover:bg-gray-100 transition-colors cursor-pointer border border-gray-100 hover:border-gray-200"
                      onClick={() => {
                        setCurrentWords({
                          future: prompt.future,
                          thing: prompt.thing,
                          theme: prompt.theme
                        });
                      }}
                    >
                      <div className="text-base leading-relaxed mb-2 flex flex-wrap items-center gap-1">
                        <span className="text-gray-700">In a </span>
                        <span className="bg-green-500 text-white px-2 py-1 rounded-lg font-semibold text-sm">
                          {prompt.future}
                        </span>
                        <span className="text-gray-700"> future, there is a </span>
                        <span className="bg-red-500 text-white px-2 py-1 rounded-lg font-semibold text-sm">
                          {prompt.thing}
                        </span>
                        <span className="text-gray-700"> related to </span>
                        <span className="bg-blue-500 text-white px-2 py-1 rounded-lg font-semibold text-sm">
                          {prompt.theme}
                        </span>
                        <span className="text-gray-700">.</span>
                      </div>
                      <div className="text-xs text-gray-500">
                        {prompt.timestamp.toLocaleDateString()} at {prompt.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

      </div>
      
      {/* Settings Page */}
      <SettingsPage
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        onWordsUpdate={handleWordsUpdate}
        currentWords={{
          future: wordCategories.future?.words || [],
          thing: wordCategories.thing?.words || [],
          theme: wordCategories.theme?.words || []
        }}
      />
      
      {/* Share Modal */}
      <ShareModal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        shareUrl="https://eclectic-bonbon-b1e2cd.netlify.app"
      />
      </div>
    </div>
  );
}

export default App;