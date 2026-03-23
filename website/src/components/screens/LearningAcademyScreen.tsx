import React, { useState } from 'react';
import { ScreenProps } from './types';
import { ArrowLeft, BookOpen, Video, FileText, Download, Play, Star, Users, Baby, GraduationCap, Search, Sparkles, Bot, Award, Clock, CheckCircle, Lock, Bookmark, TrendingUp, Brain, Zap, Globe, X } from 'lucide-react';
import { ACADEMY_COURSES, ACADEMY_PDFS, Course, PDFResource } from '../../data/learningContent';
import { getAIChatResponse } from '../../utils/aiMockService';
import { AnimatedBackground } from '../AnimatedBackground';
import { Browser } from '@capacitor/browser';
import { useSound } from '../../hooks/useSound';
import { motion, AnimatePresence } from 'framer-motion';

export function LearningAcademyScreen({ navigateTo, userData }: ScreenProps) {
  const [activeTab, setActiveTab] = useState<'courses' | 'pdfs' | 'mylearning' | 'ai-tutor'>('courses');
  const [selectedVideoUrl, setSelectedVideoUrl] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'kids' | 'parents' | 'teachers'>('all');
  const [showAITutor, setShowAITutor] = useState(false);

  // AI Chat Logic
  const [chatInput, setChatInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [messages, setMessages] = useState<Array<{ id: string, text: string, sender: 'user' | 'ai', timestamp: Date }>>([
    {
      id: 'welcome',
      text: "Hi! I'm your smart learning buddy! Ask me anything about dental health. 🤖💙",
      sender: 'ai',
      timestamp: new Date()
    }
  ]);

  const { playSound } = useSound();

  const openResource = async (url: string, e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (url.includes('nocookie')) {
      setSelectedVideoUrl(url);
      playSound('click');
    } else if (url.includes('.pdf') || url.includes('mouthhealthy.org') || url.includes('crayola.com') || url.includes('education.com') || url.includes('ada.org')) {
      // PDF or External Article -> Use In-App Browser for safety
      await Browser.open({ 
        url,
        toolbarColor: '#8b5cf6'
      });
    } else {
      window.open(url, '_blank');
    }
  };

  // ... inside component ...

  const handleSendMessage = (text: string) => {
    if (!text.trim()) return;
    const userMsg = { id: Date.now().toString(), text, sender: 'user' as const, timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setChatInput('');
    setIsTyping(true);

    setTimeout(() => {
      const responseText = getAIChatResponse(text, 'Champion');
      const aiMsg = { id: (Date.now() + 1).toString(), text: responseText, sender: 'ai' as const, timestamp: new Date() };
      setMessages(prev => [...prev, aiMsg]);
      setIsTyping(false);
    }, 1200); // Slightly more random delay?
  };

  const courses: Course[] = ACADEMY_COURSES;
  const pdfResources: PDFResource[] = ACADEMY_PDFS;

  const filteredCourses = courses.filter(course => {
    const matchesFilter = selectedFilter === 'all' || course.category === selectedFilter;
    const matchesSearch = course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const filteredPDFs = pdfResources.filter(pdf => {
    const matchesFilter = selectedFilter === 'all' || pdf.targetAudience === selectedFilter;
    const matchesSearch = pdf.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pdf.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const myLearningCourses = courses.filter(c => c.progress && c.progress > 0);
  const downloadedPDFs = pdfResources.filter(p => p.isDownloaded);

  return (
    <div className="h-full bg-gradient-to-br from-purple-100 via-pink-50 to-cyan-50 flex flex-col relative overflow-hidden">
      <AnimatedBackground />
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 via-pink-500 to-cyan-500 text-white p-6 shadow-lg relative z-10 overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-10 rounded-full -mr-32 -mt-32"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white opacity-10 rounded-full -ml-24 -mb-24"></div>

        <div className="flex items-center gap-4 relative z-10 mb-6">
          <button
            onClick={() => navigateTo('dashboard')}
            className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center hover:bg-white/30 transition-all hover-float active-pop"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex-1">
            <h1 className="text-2xl font-extrabold flex items-center gap-2">
              <GraduationCap className="w-7 h-7" />
              Learning Academy
            </h1>
            <p className="text-sm text-purple-100 mt-1">Your dental education hub 🎓</p>
          </div>
          <button
            onClick={() => setActiveTab('ai-tutor')}
            className="w-12 h-12 rounded-2xl bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center shadow-lg transition-transform relative hover-float active-pop"
          >
            <Bot className="w-6 h-6 text-white" />
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white animate-pulse"></div>
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-2 overflow-x-auto pb-2 relative z-10">
          {[
            { id: 'courses', label: 'Courses', icon: Video },
            { id: 'pdfs', label: 'PDFs', icon: FileText },
            { id: 'mylearning', label: 'My Learning', icon: BookOpen },
            { id: 'ai-tutor', label: 'AI Tutor', icon: Bot },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl whitespace-nowrap transition-all hover-float active-pop ${activeTab === tab.id
                ? 'bg-white text-purple-600 shadow-lg scale-105'
                : 'bg-white/20 backdrop-blur-sm text-white hover:bg-white/30'
                }`}
            >
              <tab.icon className="w-4 h-4" />
              <span className="text-sm font-bold">{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto relative z-10">
        {/* Tab Content */}
        <div className="p-6 space-y-6">
          {/* Search Bar */}
          {(activeTab === 'courses' || activeTab === 'pdfs') && (
            <>
              <div className="glass-card rounded-2xl p-4 shadow-lg border border-white/30 mb-4">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-purple-400" />
                  <input
                    type="text"
                    placeholder={`Search ${activeTab === 'courses' ? 'courses' : 'PDFs'}...`}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 bg-white/30 border-2 border-white/20 rounded-xl focus:outline-none focus:border-purple-500 focus:bg-white transition-all backdrop-blur-sm"
                  />
                </div>
              </div>

              {/* Filters */}
              <div className="flex gap-2 overflow-x-auto pb-2">
                {[
                  { id: 'all', label: 'All', icon: '🌟' },
                  { id: 'kids', label: 'Kids', icon: '👶' },
                  { id: 'parents', label: 'Parents', icon: '👨‍👩‍👧' },
                  { id: 'teachers', label: 'Teachers', icon: '👩‍🏫' },
                ].map((filter) => (
                  <button
                    key={filter.id}
                    onClick={() => setSelectedFilter(filter.id as any)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl whitespace-nowrap transition-all hover-float active-pop ${selectedFilter === filter.id
                      ? 'bg-gradient-to-br from-purple-500 to-pink-500 text-white shadow-lg scale-105'
                      : 'bg-white text-gray-700 border-2 border-gray-200'
                      }`}
                  >
                    <span className="text-lg">{filter.icon}</span>
                    <span className="text-sm font-bold">{filter.label}</span>
                  </button>
                ))}
              </div>
            </>
          )}

          {/* Courses Tab */}
          {activeTab === 'courses' && (
            <div className="space-y-6">
              {/* Featured Courses */}
              {selectedFilter === 'all' && !searchQuery && (
                <div className="bg-gradient-to-r from-amber-400/80 to-orange-400/80 rounded-3xl shadow-2xl p-1 backdrop-blur-md">
                  <div className="glass-card rounded-[22px] p-6">
                    <div className="flex items-center gap-2 mb-4">
                      <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-orange-400 rounded-xl flex items-center justify-center">
                        <Star className="w-5 h-5 text-white fill-white" />
                      </div>
                      <h3 className="text-xl font-extrabold text-gray-900 dark:text-white">Featured Courses</h3>
                      <span className="ml-auto px-3 py-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs font-bold rounded-full">
                        POPULAR
                      </span>
                    </div>
                    <div className="space-y-3">
                      {courses.filter(c => c.isFeatured).map((course) => (
                        <div
                          key={course.id}
                          onClick={(e) => openResource(course.url, e)}
                          className="bg-white border-2 border-purple-200 rounded-2xl p-4 transition-all cursor-pointer hover:border-purple-400 group active-pop shadow-sm hover:shadow-md"
                        >
                          <div className="flex gap-3">
                            <div className="w-16 h-16 bg-purple-100 rounded-2xl overflow-hidden flex-shrink-0 relative">
                              <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
                              <div className="absolute inset-0 bg-black/10 flex items-center justify-center opacity-0 group-hover:opacity-100">
                                <Play className="w-6 h-6 text-white" />
                              </div>
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="font-bold text-gray-900 leading-tight mb-1 line-clamp-2 group-hover:text-purple-600">{course.title}</h3>
                              <div className="flex items-center gap-2 text-[10px] text-gray-500 mb-2">
                                <span className="font-bold text-purple-600">{course.instructor}</span>
                                <span className="text-gray-300">•</span>
                                <span className="bg-gray-100 px-2 py-0.5 rounded-full">{course.duration}</span>
                              </div>
                              <p className="text-[10px] text-gray-500 line-clamp-2 leading-tight">{course.description}</p>
                              {course.progress !== undefined && course.progress > 0 && (
                                <div className="mt-2">
                                  <div className="flex items-center justify-between text-[10px] mb-1">
                                    <span className="text-gray-400">Progress</span>
                                    <span className="font-bold text-purple-600">{course.progress}%</span>
                                  </div>
                                  <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                    <div
                                      className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"
                                      style={{ width: `${course.progress}%` }}
                                    ></div>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* AI Recommended */}
              {selectedFilter === 'all' && !searchQuery && (
                <div className="bg-gradient-to-r from-cyan-500/80 to-blue-500/80 rounded-3xl shadow-2xl p-1 backdrop-blur-md">
                  <div className="glass-card rounded-[22px] p-6">
                    <div className="flex items-center gap-2 mb-4">
                      <div className="w-10 h-10 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-xl flex items-center justify-center">
                        <Sparkles className="w-5 h-5 text-white" />
                      </div>
                      <h3 className="text-xl font-extrabold text-gray-900 dark:text-white">AI Recommended for You</h3>
                    </div>
                    <p className="text-sm text-gray-600 mb-4">
                      Based on your progress and learning style 🤖✨
                    </p>
                    <div className="grid grid-cols-2 gap-3">
                      {courses.filter(c => c.aiRecommended).slice(0, 4).map((course) => (
                        <div
                          key={course.id}
                          onClick={(e) => openResource(course.url, e)}
                          className="bg-white border-2 border-cyan-100 rounded-2xl p-3 transition-all cursor-pointer hover:border-cyan-400 group active-pop shadow-sm"
                        >
                          <div className="w-full h-20 bg-cyan-50 rounded-xl overflow-hidden mb-2 relative">
                            <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
                            <div className="absolute inset-0 bg-black/10 flex items-center justify-center opacity-0 group-hover:opacity-100">
                              <Play className="w-5 h-5 text-white" />
                            </div>
                          </div>
                          <h4 className="font-bold text-[10px] text-gray-900 mb-1 line-clamp-2 group-hover:text-cyan-600">
                            {course.title}
                          </h4>
                          <div className="flex items-center gap-1 text-[9px] text-gray-500">
                            <Video className="w-3 h-3" />
                            <span>{course.lessons} lessons</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* All Courses */}
              <div>
                <h3 className="text-lg font-extrabold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  All Courses
                  <span className="text-sm font-normal text-gray-500">({filteredCourses.length})</span>
                </h3>
                <div className="space-y-4">
                  {filteredCourses.map((course) => (
                    <div
                      key={course.id}
                      onClick={(e) => openResource(course.url, e)}
                      className="bg-white rounded-2xl shadow-lg p-5 transition-all cursor-pointer border-2 border-transparent hover:border-purple-300 group hover-float active-pop"
                    >
                      <div className="flex gap-4">
                        <div className="w-24 h-24 bg-gradient-to-br from-purple-100 to-pink-100 rounded-2xl overflow-hidden flex-shrink-0 relative">
                          <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                          <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                            <div className="w-10 h-10 bg-white/90 rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                              <Play className="w-5 h-5 text-purple-600 ml-1" />
                            </div>
                          </div>
                          {course.isDownloaded && (
                            <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center shadow-lg z-10">
                              <CheckCircle className="w-3 h-3 text-white" />
                            </div>
                          )}
                        </div>

                        <div className="flex-1 min-w-0 flex flex-col justify-center">
                          <div className="flex items-start justify-between gap-2 mb-1">
                            <h4 className="font-extrabold text-gray-900 dark:text-white text-base leading-tight group-hover:text-purple-600 transition-colors" style={{ textShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                              {course.title}
                            </h4>
                            {course.aiRecommended && (
                              <span className="px-2 py-1 bg-gradient-to-r from-cyan-400 to-blue-400 text-white text-[10px] font-bold rounded-full whitespace-nowrap flex items-center gap-1 flex-shrink-0">
                                <Sparkles className="w-3 h-3" />
                                AI
                              </span>
                            )}
                          </div>

                          <p className="text-xs text-gray-600 mb-2 line-clamp-1">
                            {course.description}
                          </p>

                          <div className="flex items-center gap-3 text-xs text-gray-500">
                            <span className="flex items-center gap-1">
                              <Users className="w-3 h-3" />
                              {course.students}
                            </span>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {course.duration}
                            </span>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                              <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                              {course.rating}.0
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* PDFs Tab */}
          {activeTab === 'pdfs' && (
            <div className="space-y-6">
              {/* Downloaded PDFs */}
              {selectedFilter === 'all' && !searchQuery && downloadedPDFs.length > 0 && (
                <div className="bg-gradient-to-r from-green-500/80 to-emerald-500/80 rounded-3xl shadow-2xl p-1 backdrop-blur-md">
                  <div className="glass-card rounded-[22px] p-6">
                    <div className="flex items-center gap-2 mb-4">
                      <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-emerald-400 rounded-xl flex items-center justify-center">
                        <CheckCircle className="w-5 h-5 text-white" />
                      </div>
                      <h3 className="text-xl font-extrabold text-gray-900 dark:text-white">Downloaded for Offline</h3>
                      <span className="ml-auto px-3 py-1 bg-gradient-to-r from-green-500 to-emerald-500 text-white text-xs font-bold rounded-full flex items-center gap-1">
                        <Globe className="w-3 h-3" />
                        {downloadedPDFs.length} FILES
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      {downloadedPDFs.map((pdf) => (
                        <div
                          key={pdf.id}
                          onClick={(e) => openResource(pdf.url, e)}
                          className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 rounded-2xl p-3 hover:shadow-lg hover:-translate-y-1 transition-all cursor-pointer group relative overflow-hidden animate-float [animation-delay:0.1s]"
                        >
                          <div className="w-12 h-12 mb-2 group-hover:scale-110 transition-transform duration-300 rounded-xl overflow-hidden">
                            <img src={pdf.thumbnail} alt={pdf.title} className="w-full h-full object-cover" />
                          </div>
                          <h4 className="font-extrabold text-xs text-gray-900 dark:text-white mb-1 line-clamp-2 leading-tight" style={{ textShadow: '0 1px 2px rgba(0,0,0,0.1)' }}>
                            {pdf.title}
                          </h4>
                          <div className="flex items-center gap-1 text-xs text-green-700 font-medium">
                            <FileText className="w-3 h-3" />
                            <span>{pdf.pages} pages</span>
                          </div>

                          {/* Hover Overlay */}
                          <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <div className="bg-white/90 p-2 rounded-full shadow-lg">
                              <FileText className="w-5 h-5 text-green-600" />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* AI Recommended PDFs */}
              {selectedFilter === 'all' && !searchQuery && (
                <div className="bg-gradient-to-r from-cyan-500/80 to-blue-500/80 rounded-3xl shadow-2xl p-1 backdrop-blur-md">
                  <div className="glass-card rounded-[22px] p-6">
                    <div className="flex items-center gap-2 mb-4">
                      <div className="w-10 h-10 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-xl flex items-center justify-center">
                        <Sparkles className="w-5 h-5 text-white" />
                      </div>
                      <h3 className="text-xl font-extrabold text-gray-900 dark:text-white">AI Recommended PDFs</h3>
                    </div>
                    <div className="space-y-2">
                      {pdfResources.filter(p => p.aiRecommended).map((pdf) => (
                        <div
                          key={pdf.id}
                          onClick={(e) => openResource(pdf.url, e)}
                          className="bg-gradient-to-br from-cyan-50 to-blue-50 border-2 border-cyan-200 rounded-2xl p-3 hover:shadow-lg transition-all cursor-pointer group flex items-center gap-3 relative overflow-hidden"
                        >
                          <div className="w-12 h-12 flex-shrink-0 group-hover:scale-110 transition-transform rounded-xl overflow-hidden">
                            <img src={pdf.thumbnail} alt={pdf.title} className="w-full h-full object-cover" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <h4 className="font-extrabold text-sm text-gray-900 dark:text-white line-clamp-1" style={{ textShadow: '0 1px 2px rgba(0,0,0,0.1)' }}>{pdf.title}</h4>
                              <span className="px-1.5 py-0.5 bg-cyan-100 text-cyan-700 text-[10px] font-bold rounded-full">AI</span>
                            </div>
                            <p className="text-xs text-gray-600 line-clamp-1">{pdf.pages} pages • {pdf.size}</p>
                          </div>
                          <div className="w-8 h-8 bg-white/50 rounded-full flex items-center justify-center group-hover:bg-cyan-500 group-hover:text-white transition-colors">
                            <Download className="w-4 h-4" />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* All PDFs */}
              <div>
                <h3 className="text-lg font-extrabold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  All PDF Resources
                  <span className="text-sm font-normal text-gray-500">({filteredPDFs.length})</span>
                </h3>
                <div className="space-y-4">
                  {filteredPDFs.map((pdf) => (
                    <div
                      key={pdf.id}
                      onClick={(e) => openResource(pdf.url, e)}
                      className="glass-card rounded-2xl shadow-md p-5 hover:shadow-xl transition-all cursor-pointer border-2 border-transparent hover:border-purple-300 group hover:-translate-y-1 animate-float [animation-delay:0.2s]"
                    >
                      <div className="flex gap-4">
                        <div className="w-20 h-20 bg-gradient-to-br from-purple-100 to-pink-100 rounded-2xl flex items-center justify-center flex-shrink-0 relative overflow-hidden group">
                          <img src={pdf.thumbnail} alt={pdf.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" />
                          <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-2xl">
                            <Download className="w-6 h-6 text-purple-600 bg-white/90 p-1.5 rounded-full shadow-sm" />
                          </div>
                          {pdf.isDownloaded && (
                            <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center shadow-lg z-10">
                              <CheckCircle className="w-3 h-3 text-white" />
                            </div>
                          )}
                        </div>

                        <div className="flex-1 min-w-0 flex flex-col justify-center">
                          <div className="flex items-start justify-between gap-2 mb-1">
                            <h4 className="font-extrabold text-gray-900 dark:text-white text-base group-hover:text-purple-600 transition-colors" style={{ textShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                              {pdf.title}
                            </h4>
                            {pdf.aiRecommended && (
                              <span className="px-2 py-1 bg-gradient-to-r from-cyan-400 to-blue-400 text-white text-[10px] font-bold rounded-full whitespace-nowrap flex items-center gap-1 flex-shrink-0">
                                <Sparkles className="w-3 h-3" />
                                AI
                              </span>
                            )}
                          </div>

                          <p className="text-xs text-gray-600 mb-2 line-clamp-1">
                            {pdf.description}
                          </p>

                          <div className="flex items-center gap-3 text-xs text-gray-500">
                            <span className="flex items-center gap-1">
                              <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                              <span className="font-bold text-gray-700">{pdf.rating}</span>
                            </span>
                            <span className="flex items-center gap-1">
                              <Users className="w-3 h-3" />
                              {pdf.views}
                            </span>
                            <span className="bg-gray-100 px-1.5 py-0.5 rounded text-[10px] font-medium text-gray-600">
                              {pdf.size}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* My Learning Tab */}
          {activeTab === 'mylearning' && (
            <div className="space-y-6">
              {/* Stats Overview */}
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-4 text-white shadow-lg">
                  <div className="flex items-center justify-center w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl mb-2 mx-auto">
                    <Video className="w-5 h-5" />
                  </div>
                  <div className="text-2xl font-extrabold text-center">{myLearningCourses.length}</div>
                  <div className="text-xs text-center text-purple-100">In Progress</div>
                </div>

                <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl p-4 text-white shadow-lg">
                  <div className="flex items-center justify-center w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl mb-2 mx-auto">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div className="text-2xl font-extrabold text-center">{downloadedPDFs.length}</div>
                  <div className="text-xs text-center text-green-100">Downloaded</div>
                </div>

                <div className="bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl p-4 text-white shadow-lg">
                  <div className="flex items-center justify-center w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl mb-2 mx-auto">
                    <Award className="w-5 h-5" />
                  </div>
                  <div className="text-2xl font-extrabold text-center">2</div>
                  <div className="text-xs text-center text-amber-100">Completed</div>
                </div>
              </div>

              {/* Continue Learning */}
              <div>
                <h3 className="text-lg font-extrabold text-gray-900 dark:text-white mb-4">Continue Learning</h3>
                <div className="space-y-3">
                  {myLearningCourses.map((course) => (
                    <div
                      key={course.id}
                      onClick={(e) => openResource(course.url, e)}
                      className="bg-white rounded-2xl shadow-lg p-5 hover:shadow-xl transition-all cursor-pointer border-2 border-transparent hover:border-purple-300 group"
                    >
                      <div className="flex gap-4">
                        <div className="w-16 h-16 bg-gradient-to-br from-purple-100 to-pink-100 rounded-2xl overflow-hidden flex-shrink-0 relative">
                          <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                          <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                            <div className="w-8 h-8 bg-white/90 rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                              <Play className="w-4 h-4 text-purple-600 ml-0.5" />
                            </div>
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-bold text-gray-900 dark:text-white mb-1 group-hover:text-purple-600 transition-colors">{course.title}</h4>
                          <p className="text-xs text-gray-600 mb-2">{course.instructor}</p>

                          <div className="mb-2">
                            <div className="flex items-center justify-between text-xs mb-1">
                              <span className="text-gray-600">Progress</span>
                              <span className="font-bold text-purple-600">{course.progress}%</span>
                            </div>
                            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"
                                style={{ width: `${course.progress}%` }}
                              ></div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Downloaded Resources */}
              <div>
                <h3 className="text-lg font-extrabold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <Globe className="w-5 h-5 text-green-500" />
                  Offline Available
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  {downloadedPDFs.map((pdf) => (
                    <div
                      key={pdf.id}
                      onClick={(e) => openResource(pdf.url, e)}
                      className="bg-white rounded-2xl shadow-lg p-4 hover:shadow-xl transition-all cursor-pointer group relative overflow-hidden border-2 border-transparent hover:border-green-300"
                    >
                      <div className="w-16 h-16 mb-2 group-hover:scale-110 transition-transform duration-300 rounded-2xl overflow-hidden">
                        <img src={pdf.thumbnail} alt={pdf.title} className="w-full h-full object-cover" />
                      </div>
                      <h4 className="font-bold text-sm text-gray-900 dark:text-white mb-1 line-clamp-2 leading-tight">
                        {pdf.title}
                      </h4>
                      <p className="text-xs text-gray-600 mb-0">{pdf.pages} pages</p>

                      {/* Hover Overlay */}
                      <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <div className="bg-white/90 p-2 rounded-full shadow-lg">
                          <FileText className="w-5 h-5 text-green-600" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* AI Tutor Tab */}
          {activeTab === 'ai-tutor' && (
            <div className="space-y-6 h-full flex flex-col">
              {/* Chat Interface */}
              <div className="bg-gradient-to-r from-cyan-500/80 to-blue-500/80 rounded-3xl shadow-2xl p-1 flex-1 flex flex-col min-h-[500px] backdrop-blur-md">
                <div className="glass-card rounded-[22px] flex-1 flex flex-col overflow-hidden">

                  {/* Chat Header */}
                  <div className="p-4 border-b border-gray-100 bg-white shadow-sm z-10">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-2xl flex items-center justify-center shadow-lg">
                        <Bot className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="font-extrabold text-gray-900 dark:text-white flex items-center gap-2">
                          AI Learning Tutor
                          <span className="px-2 py-0.5 bg-green-500 text-white text-[10px] font-bold rounded-full animate-pulse">
                            ONLINE
                          </span>
                        </h3>
                        <p className="text-xs text-gray-500">Ask me anything!</p>
                      </div>
                    </div>
                  </div>

                  {/* Messages Area */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
                    {messages.map((msg) => (
                      <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`flex items-end gap-2 max-w-[85%] ${msg.sender === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${msg.sender === 'user' ? 'bg-purple-100' : 'bg-cyan-100'}`}>
                            {msg.sender === 'user' ? '👤' : '🤖'}
                          </div>
                          <div
                            className={`p-3 rounded-2xl text-sm leading-relaxed ${msg.sender === 'user'
                              ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-tr-none shadow-lg'
                              : 'bg-white border-2 border-gray-100 rounded-tl-none shadow-sm text-gray-800'
                              }`}
                          >
                            {msg.text}
                          </div>
                        </div>
                      </div>
                    ))}
                    {isTyping && (
                      <div className="flex justify-start">
                        <div className="bg-gray-200 rounded-full px-4 py-2 text-xs text-gray-500 animate-pulse">
                          AI is typing...
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Input Area */}
                  <div className="p-3 bg-white border-t border-gray-100">
                    <div className="flex w-full items-center bg-gray-50 p-1.5 rounded-2xl border-2 border-gray-200 focus-within:border-cyan-500 focus-within:bg-white focus-within:ring-4 focus-within:ring-cyan-50 transition-all">
                      <input
                        type="text"
                        value={chatInput}
                        onChange={(e) => setChatInput(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSendMessage(chatInput)}
                        placeholder="Type your question..."
                        className="flex-1 bg-transparent px-3 py-2 outline-none text-sm text-gray-800 placeholder-gray-400"
                      />
                      <div className="flex items-center mx-1">
                        <button
                          onClick={() => handleSendMessage(chatInput)}
                          disabled={!chatInput.trim() || isTyping}
                          className="w-10 h-10 flex items-center justify-center bg-cyan-600 rounded-xl text-white hover:bg-cyan-700 hover:shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
                        >
                          <Zap className="w-5 h-5" strokeWidth={2.5} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Suggestions / Popular Questions */}
              <div>
                <h3 className="text-sm font-extrabold text-gray-900 mb-2 px-2">💡 Try asking:</h3>
                <div className="flex flex-wrap gap-2">
                  {[
                    'How do I brush correctly? 🦷',
                    'What causes cavities? 🦠',
                    'Why is sugar bad? 🍬',
                    'Tell me a fun dental fact! 🌟'
                  ].map((q, i) => (
                    <button
                      key={i}
                      onClick={() => handleSendMessage(q)}
                      className="px-3 py-2 bg-white border-2 border-purple-100 rounded-xl text-xs font-bold text-purple-600 hover:bg-purple-50 hover:border-purple-300 transition-all shadow-sm"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>
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
              <div className="bg-gradient-to-r from-purple-600 to-pink-500 px-5 py-4 flex items-center justify-between overflow-hidden rounded-t-[1.7rem]">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center border border-white/20">
                    <Video className="w-5 h-5 text-white" />
                  </div>
                  <div className="text-left">
                    <p className="text-[10px] font-black text-purple-100 uppercase tracking-widest leading-none mb-1">Learning Academy</p>
                    <p className="text-white font-black text-sm md:text-lg truncate max-w-[150px] md:max-w-md">
                      {ACADEMY_COURSES.find(c => c.url === selectedVideoUrl)?.title || "Premium Lesson"}
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
    </div >
  );
}