import React, { useState } from 'react';
import { ScreenProps } from './types';
import { ArrowLeft, BookOpen, Video, FileText, Download, Play, Star, Users, Baby, GraduationCap, Search, Sparkles, Bot, Zap, X } from 'lucide-react';
import { Browser } from '@capacitor/browser';
import { motion, AnimatePresence } from 'framer-motion';

import { LEARNING_RESOURCES, Resource } from '../../data/learningContent';
import { getAIChatResponse } from '../../utils/aiMockService';
import { useSound } from '../../hooks/useSound';

export function LearningResourcesScreen({ navigateTo }: ScreenProps) {
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'kids' | 'parents' | 'teachers'>('all');
  const [selectedType, setSelectedType] = useState<'all' | 'video' | 'pdf' | 'interactive'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showAIAssistant, setShowAIAssistant] = useState(false);
  const [selectedVideoUrl, setSelectedVideoUrl] = useState<string | null>(null);

  const { playSound } = useSound();

  // AI Chat Logic
  const [chatInput, setChatInput] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [isAiThinking, setIsAiThinking] = useState(false);

  const handleAiQuery = (query: string) => {
    if (!query.trim()) return;
    setChatInput(query);
    setIsAiThinking(true);

    // Simulate thinking
    setTimeout(() => {
      const response = getAIChatResponse(query);
      setAiResponse(response);
      setIsAiThinking(false);
    }, 1500);
  };

  // Helper to open resources
  const handleResourceClick = async (resource: Resource, e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    const url = resource.url;
    if (url.includes('nocookie')) {
      setSelectedVideoUrl(url);
      playSound('click');
    } else if (url.includes('.pdf') || url.includes('mouthhealthy.org') || url.includes('crayola.com') || url.includes('healthline.com') || url.includes('wikipedia.org')) {
      // Open in themed In-App Browser
      await Browser.open({ 
        url,
        toolbarColor: '#8b5cf6', // Indigo/Purple to match theme
      });
    } else {
      window.open(url, '_blank');
    }
  };

  const resources: Resource[] = LEARNING_RESOURCES;

  const filteredResources = resources.filter(resource => {
    const matchesCategory = selectedCategory === 'all' || resource.category === selectedCategory;
    const matchesType = selectedType === 'all' || resource.type === selectedType;
    const matchesSearch = resource.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      resource.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesType && matchesSearch;
  });

  const aiRecommendations = resources.filter(r => r.aiRecommended);

  return (
    <div className="h-full bg-gradient-to-br from-purple-100 via-pink-50 to-cyan-50 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-500 text-white p-6 shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 w-40 h-40 bg-white opacity-10 rounded-full -mr-20 -mt-20"></div>
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-white opacity-10 rounded-full -ml-16 -mb-16"></div>

        <div className="flex items-center gap-4 relative z-10">
          <button
            onClick={() => navigateTo('dashboard')}
            className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center hover:bg-white/30 transition-all"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex-1">
            <h1 className="text-2xl font-extrabold flex items-center gap-2">
              <BookOpen className="w-7 h-7" />
              Learning Resources
            </h1>
            <p className="text-sm text-purple-100 mt-1">Educational content for everyone!</p>
          </div>
          <button
            onClick={() => setShowAIAssistant(!showAIAssistant)}
            className="w-12 h-12 rounded-2xl bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center shadow-lg hover:scale-110 transition-transform relative"
          >
            <Bot className="w-6 h-6 text-white" />
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white"></div>
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="p-6 space-y-6">
          {/* AI Assistant Panel */}

          {showAIAssistant && (
            <div className="bg-gradient-to-r from-cyan-500 to-blue-500 rounded-3xl shadow-2xl p-1 animate-slideDown">
              <div className="bg-white rounded-[22px] p-6">
                <div className="flex items-start gap-3 mb-4">
                  <div className="w-14 h-14 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg">
                    <Bot className="w-7 h-7 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-extrabold text-gray-900 flex items-center gap-2">
                      AI Learning Assistant
                      <span className="px-2 py-1 bg-gradient-to-r from-green-400 to-emerald-400 text-white text-xs font-bold rounded-full">
                        ONLINE
                      </span>
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">
                      {aiResponse || "Hi! I'm your smart learning buddy! Ask me anything about dental health. 🤖💙"}
                    </p>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-2xl p-4 mb-4">
                  {aiResponse ? (
                    <div className="animate-fadeIn">
                      <p className="font-bold text-gray-900 mb-2">My Answer to "{chatInput}":</p>
                      <p className="text-gray-700">{aiResponse}</p>
                      <button
                        onClick={() => { setAiResponse(''); setChatInput(''); }}
                        className="mt-3 text-sm text-cyan-600 font-bold hover:underline"
                      >
                        Ask another question
                      </button>
                    </div>
                  ) : (
                    <>
                      <p className="text-sm text-gray-700 mb-3 font-medium">💡 Popular Questions:</p>
                      <div className="space-y-2">
                        {[
                          'How often should kids brush their teeth?',
                          'What age should children start flossing?',
                          'Best toothpaste for sensitive teeth?',
                          'How to make brushing fun for kids?'
                        ].map((question, index) => (
                          <button
                            key={index}
                            onClick={() => handleAiQuery(question)}
                            className="w-full text-left px-4 py-2 bg-white rounded-xl text-sm text-gray-700 hover:bg-purple-50 hover:text-purple-700 transition-all border border-gray-200"
                          >
                            {question}
                          </button>
                        ))}
                      </div>
                    </>
                  )}
                </div>

                <div className="flex gap-2">
                  <input
                    type="text"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleAiQuery(chatInput)}
                    placeholder="Ask me anything about dental health..."
                    className="flex-1 px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-cyan-500 focus:bg-white transition-all"
                  />
                  <button
                    onClick={() => handleAiQuery(chatInput)}
                    disabled={isAiThinking || !chatInput.trim()}
                    className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-bold rounded-xl hover:shadow-lg hover:scale-105 transition-all disabled:opacity-50"
                  >
                    {isAiThinking ? 'Thinking...' : 'Ask AI'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Search Bar */}
          <div className="bg-white rounded-2xl shadow-lg p-4">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search resources..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-purple-500 focus:bg-white transition-all"
              />
            </div>
          </div>

          {/* Category Filters */}
          <div className="bg-white rounded-2xl shadow-lg p-4">
            <h3 className="text-sm font-bold text-gray-700 mb-3">Who is learning?</h3>
            <div className="grid grid-cols-4 gap-2">
              {[
                { id: 'all', label: 'All', icon: '🌟' },
                { id: 'kids', label: 'Kids', icon: '👶' },
                { id: 'parents', label: 'Parents', icon: '👨‍👩‍👧' },
                { id: 'teachers', label: 'Teachers', icon: '👩‍🏫' },
              ].map((category) => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id as any)}
                  className={`flex flex-col items-center gap-2 p-3 rounded-xl transition-all ${selectedCategory === category.id
                    ? 'bg-gradient-to-br from-purple-500 to-pink-500 text-white shadow-lg scale-105'
                    : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                    }`}
                >
                  <span className="text-2xl">{category.icon}</span>
                  <span className="text-xs font-bold">{category.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Type Filters */}
          <div className="flex gap-2 overflow-x-auto pb-2">
            {[
              { id: 'all', label: 'All Types', icon: Sparkles },
              { id: 'video', label: 'Videos', icon: Video },
              { id: 'pdf', label: 'PDFs', icon: FileText },
              { id: 'interactive', label: 'Interactive', icon: Play },
            ].map((type) => (
              <button
                key={type.id}
                onClick={() => setSelectedType(type.id as any)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl whitespace-nowrap transition-all ${selectedType === type.id
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-lg'
                  : 'bg-white text-gray-700 border-2 border-gray-200'
                  }`}
              >
                <type.icon className="w-4 h-4" />
                <span className="text-sm font-bold">{type.label}</span>
              </button>
            ))}
          </div>

          {/* AI Recommendations */}
          {selectedCategory === 'all' && selectedType === 'all' && !searchQuery && (
            <div className="bg-gradient-to-r from-amber-400 to-orange-400 rounded-3xl shadow-2xl p-1">
              <div className="bg-white rounded-[22px] p-6">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-orange-400 rounded-xl flex items-center justify-center">
                    <Sparkles className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-xl font-extrabold text-gray-900">AI Recommendations</h3>
                  <span className="ml-auto px-3 py-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs font-bold rounded-full">
                    FOR YOU
                  </span>
                </div>
                <p className="text-sm text-gray-600 mb-4">
                  Based on your progress and interests, our AI suggests these resources! 🤖✨
                </p>
                <div className="grid grid-cols-2 gap-3">
                  {aiRecommendations.slice(0, 4).map((resource) => (
                    <div
                      key={resource.id}
                      onClick={(e) => handleResourceClick(resource, e)}
                      className="bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200 rounded-2xl p-4 hover:shadow-lg hover:scale-105 transition-all cursor-pointer"
                    >
                      <div className="w-full h-32 mb-2 bg-gradient-to-br from-purple-100 to-pink-100 rounded-xl overflow-hidden">
                        <img src={resource.thumbnail} alt={resource.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                      </div>
                      <h4 className="font-bold text-sm text-gray-900 mb-1 line-clamp-2">
                        {resource.title}
                      </h4>
                      <div className="flex items-center gap-1 text-xs text-gray-600">
                        {resource.type === 'video' && <Video className="w-3 h-3" />}
                        {resource.type === 'pdf' && <FileText className="w-3 h-3" />}
                        {resource.type === 'interactive' && <Play className="w-3 h-3" />}
                        <span>{resource.duration || `${resource.pages} pages`}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Resources Grid */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-extrabold text-gray-900">
                {filteredResources.length} Resources Found
              </h3>
            </div>

            <div className="space-y-4">
              {filteredResources.map((resource) => (
                <div
                  key={resource.id}
                  onClick={(e) => handleResourceClick(resource, e)}
                  className="bg-white rounded-2xl shadow-lg p-5 hover:shadow-xl transition-all cursor-pointer border-2 border-transparent hover:border-purple-300 group"
                >
                  <div className="flex gap-4">
                    {/* Thumbnail with Overlay */}
                    <div className="w-24 h-24 bg-gradient-to-br from-purple-100 to-pink-100 rounded-2xl flex items-center justify-center text-5xl flex-shrink-0 relative overflow-hidden">
                      <img src={resource.thumbnail} alt={resource.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />

                      {/* Hover Overlay */}
                      <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-2xl">
                        <div className="w-10 h-10 bg-white/90 rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                          {resource.type === 'video' || resource.type === 'interactive' ? (
                            <Play className="w-5 h-5 text-purple-600 ml-0.5" />
                          ) : (
                            <Download className="w-5 h-5 text-purple-600" />
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0 flex flex-col justify-center">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <h4 className="font-extrabold text-gray-900 text-base line-clamp-1 group-hover:text-purple-600 transition-colors">
                          {resource.title}
                        </h4>
                        {resource.aiRecommended && (
                          <span className="px-2 py-1 bg-gradient-to-r from-amber-400 to-orange-400 text-white text-[10px] font-bold rounded-full whitespace-nowrap flex items-center gap-1 flex-shrink-0">
                            <Sparkles className="w-3 h-3" />
                            AI
                          </span>
                        )}
                      </div>

                      <p className="text-sm text-gray-600 mb-2 line-clamp-1">
                        {resource.description}
                      </p>

                      <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500">
                        {/* Type Badge */}
                        <span className="flex items-center gap-1 font-medium bg-gray-100 px-2 py-0.5 rounded-md">
                          {resource.type === 'video' && <Video className="w-3 h-3" />}
                          {resource.type === 'pdf' && <FileText className="w-3 h-3" />}
                          {resource.type === 'interactive' && <Play className="w-3 h-3" />}
                          {resource.type === 'video' ? resource.duration : `${resource.pages} pgs`}
                        </span>

                        {/* Rating */}
                        <span className="flex items-center gap-1">
                          <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                          <span className="font-bold text-gray-700">{resource.rating}</span>
                        </span>

                        {/* Views */}
                        <span className="flex items-center gap-1">
                          <Users className="w-3 h-3" />
                          {resource.views}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* No Results */}
          {filteredResources.length === 0 && (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-xl font-extrabold text-gray-900 mb-2">No resources found</h3>
              <p className="text-gray-600">Try adjusting your filters or search terms</p>
            </div>
          )}
        </div>
      </div>

      {/* Refined Classic Video Modal (White Frame, No Cropping) */}
      <AnimatePresence>
        {selectedVideoUrl && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-[#0a0a0f]/95 backdrop-blur-sm z-[2000] flex items-center justify-center p-4 md:p-10"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setSelectedVideoUrl(null);
            }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-4xl bg-white rounded-[2rem] shadow-[0_20px_60px_rgba(0,0,0,0.5)] border-4 border-white relative flex flex-col mx-4"
              onClick={(e) => e.stopPropagation()}
            >

              {/* Compact Branded Header (Stacked) */}
              <div className="bg-gradient-to-r from-teal-500 to-cyan-500 px-5 py-4 flex items-center justify-between overflow-hidden rounded-t-[1.7rem]">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center border border-white/20">
                    <Video className="w-5 h-5 text-white" />
                  </div>
                  <div className="text-left">
                    <p className="text-[10px] font-black text-teal-100 uppercase tracking-widest leading-none mb-1">Learning Resources</p>
                    <p className="text-white font-black text-sm md:text-lg truncate max-w-[150px] md:max-w-md">
                      {LEARNING_RESOURCES.find(r => r.url === selectedVideoUrl)?.title || "Premium Resource"}
                    </p>
                  </div>
                </div>
                
                {/* User Image Style: Circular Back Button on Right */}
                <button
                  onClick={() => setSelectedVideoUrl(null)}
                  className="w-10 h-10 rounded-full bg-white/30 hover:bg-white/40 flex items-center justify-center transition-all active:scale-95 border border-white/20 shadow-inner"
                >
                   <ArrowLeft className="w-6 h-6 text-white" />
                </button>
              </div>

              {/* Video Area (Explicit min-height to prevent crushing) */}
              <div className="w-full bg-black relative flex items-center justify-center overflow-hidden rounded-b-[1.7rem]" style={{ aspectRatio: '16/9', minHeight: '220px' }}>
                <iframe
                  src={`${selectedVideoUrl}${selectedVideoUrl.includes('?') ? '&' : '?'}autoplay=1&modestbranding=1&rel=0`}
                  className="absolute inset-0 w-full h-full border-none"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <style dangerouslySetInnerHTML={{
        __html: `
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-slideDown {
          animation: slideDown 0.3s ease-out;
        }
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        @keyframes pop-in {
          0% { transform: scale(0.9); opacity: 0; }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes fade-in {
          0% { opacity: 0; }
          100% { opacity: 1; }
        }
      ` }} />
    </div>
  );
}
