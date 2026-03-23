import React, { useState } from 'react';
import { ScreenProps } from './types';
import { ChevronLeft, X, CheckCircle, Circle, ArrowRight, Lightbulb, Mic } from 'lucide-react';
import { useSound } from '../../hooks/useSound';
import { VTuberBrushingQuest, VTuberQuestHandle } from './VTuberBrushingQuest';

const lessonSteps = [
  {
    title: 'Front Attack',
    subtitle: 'Polish those pearly whites!',
    instruction: 'Brush the front surfaces using circular motions. Angle the brush at 45 degrees toward your gums.',
    tips: ['Circular motions only', '45-degree angle', 'Soft pressure'],
    duration: '30 seconds',
    illustration: '/thumbnails/brush_step_1.png'
  },
  {
    title: 'Sides & Back',
    subtitle: 'Hunt down the sugar bugs!',
    instruction: 'Reach all the way to the molars. Use short, gentle strokes to clean the side and chewing surfaces.',
    tips: ['Reach the back teeth', 'Short strokes', 'Clear the gaps'],
    duration: '30 seconds',
    illustration: '/thumbnails/brush_step_2.png'
  },
  {
    title: 'Inner Stronghold',
    subtitle: 'Defend the inner walls!',
    instruction: 'Tilt the brush vertically for the inner surfaces of your front teeth. Move it up and down.',
    tips: ['Tilt the brush', 'Up and down strokes', 'Inner surfaces matter'],
    duration: '30 seconds',
    illustration: '/thumbnails/brush_step_3.png'
  },
  {
    title: 'Tongue Polish',
    subtitle: 'Fresh Breath Victory!',
    instruction: 'Gently sweep your tongue from back to front to banish bacteria.',
    tips: ['Back to front', 'Be very gentle', 'Victory is near!'],
    duration: '30 seconds',
    illustration: '/thumbnails/brush_step_4.png'
  },
];

import { rpgService } from '../../services/rpgService';
import { useRef, useEffect, useCallback } from 'react';
import { useAuth, API_URL } from '../../context/AuthContext';

export function BrushingLessonScreen({ navigateTo, userData, updateUserData }: ScreenProps) {
  const [step, setStep] = useState(0);
  const { playSound } = useSound();
  const currentStep = lessonSteps[step];
  const { currentUser } = useAuth();

  // --- GLOBAL GAME ENGINE STATE ---
  const [timeLeft, setTimeLeft] = useState(30);
  const brushRef = useRef<HTMLDivElement>(null);
  const brushImgRef = useRef<HTMLImageElement>(null);
  const brushingActiveRef = useRef(false);
  const timeLeftRef = useRef(30);
  const containerRef = useRef<HTMLDivElement>(null);

  const [aiState, setAiState] = useState({ isRecording: false, isThinking: false, aiText: "", audioUnlocked: false });
  const [chatInputValue, setChatInputValue] = useState("");
  const questRef = useRef<VTuberQuestHandle>(null);

  const handleAisend = () => {
    if (!chatInputValue.trim()) return;
    questRef.current?.processAI(chatInputValue);
    setChatInputValue("");
  };

  // Sync refs for the interval
  useEffect(() => {
    timeLeftRef.current = 30;
    setTimeLeft(30);
  }, [step]);

  // Timer loop
  useEffect(() => {
    const interval = setInterval(() => {
      if (brushingActiveRef.current && timeLeftRef.current > 0) {
        timeLeftRef.current -= 1;
        setTimeLeft(timeLeftRef.current);
        if (timeLeftRef.current === 0) {
          handleNext();
        }
      }
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleTrackingUpdate = useCallback((pos: { x: number, y: number } | null) => {
    brushingActiveRef.current = !!pos;
    if (brushRef.current && brushImgRef.current) {
      if (pos) {
        brushRef.current.style.left = `${pos.x * 100}%`;
        brushRef.current.style.top = `${pos.y * 100}%`;
        brushRef.current.style.opacity = '1';
        brushImgRef.current.style.transform = `scale(0.8) rotate(${Math.sin(Date.now() / 100) * 10 - 20}deg)`;
      } else {
        brushRef.current.style.opacity = '0';
        brushImgRef.current.style.transform = `scale(0.8) rotate(-20deg)`;
      }
    }
  }, []);

  const handleNext = async () => {
    if (step < lessonSteps.length - 1) {
      playSound('click');
      setStep(step + 1);
    } else {
      // 1. Update local state via rpgService (offline-first)
      const rpgRewards = rpgService.rewardTaskCompletion(userData, 'brush');
      updateUserData(rpgRewards);

      // 2. Sync to backend so logs show the real interaction
      if (currentUser?.uid) {
        const uid = currentUser.uid;
        try {
          // Log brushing session
          await fetch(`${API_URL}/game/${uid}/brushing-log`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ duration_seconds: 120, quality_score: 85 })
          }).catch(() => {});

          // Award XP
          await fetch(`${API_URL}/game/${uid}/xp`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ amount: 50, reason: 'brushing_lesson_complete' })
          }).catch(() => {});

          // Mark daily quest progress
          await fetch(`${API_URL}/quests/${uid}/progress`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ quest_id: 'daily_brush_morning', increment: 1 })
          }).catch(() => {});
        } catch (e) {
          // Backend offline — local save still works
        }
      }

      navigateTo('lesson-complete');
    }
  };

  const handlePrevious = () => {
    if (step > 0) {
      playSound('click');
      setStep(step - 1);
    }
  };

  return (
    <div className="h-full bg-white flex flex-col relative">
      {/* ASSET PRELOAD (Nuclear Stability) */}
      <div className="hidden pointer-events-none opacity-0 overflow-hidden">
        <img src="/thumbnails/brush.png" alt="preload" />
        <img src="/thumbnails/tooth_kingdom_bg.png" alt="preload" />
      </div>

      {/* Header */}
      <div className="bg-white px-5 pt-4 pb-3 border-b border-gray-100">
        <div className="flex items-center justify-between mb-3">
          <button
            onClick={() => navigateTo('chapters')}
            className="p-2 -ml-2 hover:bg-gray-100 rounded-xl transition-all animate-float hover:-translate-x-1"
          >
            <ChevronLeft className="w-6 h-6 text-gray-700" />
          </button>
          <h1 className="font-bold text-gray-900 text-base">The Brushing Quest</h1>
          <div className="flex items-center gap-3">
            <div className="bg-purple-600/10 border border-purple-500/20 px-3 py-1.5 rounded-full flex items-center gap-2">
              <span className="text-[10px] font-black text-purple-700 uppercase tracking-widest">Shield Charge</span>
              <span className={`text-sm font-black tabular-nums ${timeLeft < 5 ? 'text-red-600 animate-pulse' : 'text-purple-600'}`}>
                00:{timeLeft.toString().padStart(2, '0')}
              </span>
            </div>
          </div>
          <button
            onClick={() => navigateTo('dashboard')}
            className="p-2 -mr-2 hover:bg-gray-100 rounded-xl transition-all animate-float hover:scale-110"
          >
            <X className="w-6 h-6 text-gray-700" />
          </button>
        </div>

        {/* Progress bar */}
        <div className="flex items-center gap-3">
          <div className="flex-1 progress-bar-child">
            <div
              className="progress-bar-fill"
              style={{ width: `${((step + 1) / lessonSteps.length) * 100}%` }}
            ></div>
          </div>
          <span className="text-xs font-bold text-gray-600">
            {step + 1}/{lessonSteps.length}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-5 py-5 space-y-5">
        {/* Step badge */}
        <div className="flex items-center gap-2">
          <div className="bg-purple-100 text-purple-700 px-4 py-2 rounded-full text-sm font-bold">
            Lesson {step + 1}
          </div>
          <div className="bg-blue-100 text-blue-700 px-4 py-2 rounded-full text-sm font-bold">
            {currentStep.duration}
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-extrabold text-gray-900 mb-2 leading-tight">
              {currentStep.title}
            </h2>
            <p className="text-purple-600 font-semibold text-sm">
              {currentStep.subtitle}
            </p>
          </div>

          {/* External Audio Unlocker (Outside the Model Box) */}
          {!aiState.audioUnlocked && (
            <button
              onClick={() => questRef.current?.unlockAudio()}
              className="bg-purple-600 text-white px-4 py-2 rounded-2xl font-bold text-xs shadow-lg animate-pulse hover:bg-purple-500 transition-all flex items-center gap-2"
            >
              <span>🔓 Tap to Enable Voice</span>
            </button>
          )}
          {aiState.audioUnlocked && (
            <div className="bg-green-500/10 backdrop-blur-md px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 border border-green-500/30 text-green-600 shadow-[0_0_15px_rgba(34,197,94,0.3)] shimmer-green">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
              </span>
              ✨ Voice Active
            </div>
          )}
        </div>

        {/* VTuber Canvas Block */}
        <div className="space-y-4">
          <div
            ref={containerRef}
            className="w-full rounded-[2.5rem] overflow-hidden relative group border-4 border-purple-500/20"
            style={{
              maxHeight: '550px',
              aspectRatio: '16/10',
              backgroundColor: '#0c051d',
              boxShadow: '0 20px 50px rgba(0,0,0,0.3), 0 0 30px rgba(147, 51, 234, 0.2)',
            }}
          >
            <VTuberBrushingQuest
              ref={questRef}
              currentStepIndex={step}
              onTrackingUpdate={handleTrackingUpdate}
              onAIStateChange={(state) => setAiState(state)}
            />

            {/* AI Speech Bubble (Inside the box, above Haru) */}
            {aiState.aiText && (
              <div className="absolute top-10 left-1/2 -translate-x-1/2 z-30 w-full flex justify-center px-4 pointer-events-none">
                <div className="bg-white/90 backdrop-blur-md p-4 rounded-2xl shadow-xl border-2 border-indigo-400 max-w-sm animate-bounce-up">
                  <p className="text-indigo-900 font-medium text-sm text-center">{aiState.aiText}</p>
                  <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-white rotate-45 border-r-2 border-b-2 border-indigo-400" />
                </div>
              </div>
            )}

            {/* Magical Brush (User Asset) */}
            <div className="absolute inset-0 z-20 pointer-events-none">
              <div
                ref={brushRef}
                className="absolute z-30 transition-opacity duration-300"
                style={{
                  left: '50%',
                  top: '50%',
                  opacity: 0,
                  transform: 'translate(-50%, -50%)',
                }}
              >
                <img
                  ref={brushImgRef}
                  src="/thumbnails/brush.png"
                  className="w-16 h-16 transition-transform duration-75"
                  style={{
                    transform: 'scale(0.8) rotate(-20deg)',
                    filter: 'drop-shadow(0 0 15px rgba(168, 85, 247, 0.6))'
                  }}
                />
              </div>
            </div>
          </div>

          {/* AI Interaction Bar (Outside & Below the box) */}
          <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-3xl p-4 border-2 border-indigo-100 shadow-lg">
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${aiState.isThinking ? 'bg-amber-500 animate-pulse' : aiState.isRecording ? 'bg-red-500 animate-pulse' : 'bg-green-500'}`} />
                <span className="text-[10px] font-bold text-indigo-700 uppercase tracking-wider">
                  {aiState.isThinking ? 'Guide Tanu is thinking...' : aiState.isRecording ? 'Guide Tanu is listening...' : 'Guide Tanu is ready'}
                </span>
              </div>

              <div className="flex w-full items-center bg-white p-1.5 rounded-2xl border-2 border-indigo-100 shadow-sm hover:border-indigo-200 focus-within:border-purple-400 focus-within:ring-4 focus-within:ring-purple-50 transition-all">
                <input
                  type="text"
                  placeholder={aiState.isRecording ? "Listening..." : "Ask Guide Tanu anything about teeth..."}
                  className="flex-1 bg-transparent px-3 py-2 text-indigo-900 placeholder-indigo-300 outline-none text-sm font-medium disabled:opacity-50"
                  value={chatInputValue}
                  onChange={(e) => setChatInputValue(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleAisend()}
                  disabled={aiState.isRecording || aiState.isThinking}
                />

                <div className="flex items-center gap-1 mx-1">
                  {chatInputValue.trim() ? (
                    <button
                      onClick={handleAisend}
                      disabled={aiState.isThinking || aiState.isRecording}
                      className="w-10 h-10 flex items-center justify-center bg-purple-600 rounded-xl text-white shadow-sm hover:bg-purple-700 hover:shadow-md transition-all disabled:opacity-50 active:scale-95"
                    >
                      <ArrowRight className="w-5 h-5" strokeWidth={3} />
                    </button>
                  ) : (
                    <button
                      onMouseDown={(e) => { e.preventDefault(); !aiState.isThinking && questRef.current?.startRecording(); }}
                      onMouseUp={(e) => { e.preventDefault(); questRef.current?.stopRecording(); }}
                      onMouseLeave={(e) => { e.preventDefault(); questRef.current?.stopRecording(); }}
                      onTouchStart={(e) => { e.preventDefault(); !aiState.isThinking && questRef.current?.startRecording(); }}
                      onTouchEnd={(e) => { e.preventDefault(); questRef.current?.stopRecording(); }}
                      disabled={aiState.isThinking}
                      className={`w-10 h-10 flex items-center justify-center rounded-xl transition-all active:scale-95 disabled:opacity-50 touch-none ${aiState.isRecording
                        ? 'bg-red-500 text-white shadow-md animate-pulse'
                        : 'bg-indigo-50 text-indigo-500 hover:bg-indigo-100'
                        }`}
                    >
                      <Mic className="w-5 h-5" strokeWidth={2.5} />
                    </button>
                  )}
                </div>
              </div>

              {/* Quick Prompts (Mockup Fast-Track) */}
              <div className="flex flex-wrap gap-2 mt-1">
                <button
                  onClick={() => questRef.current?.processAI("How do I brush?")}
                  disabled={aiState.isThinking || aiState.isRecording}
                  className="px-3 py-1.5 bg-white border border-indigo-100 rounded-full text-xs font-semibold text-indigo-600 hover:bg-indigo-50 hover:border-indigo-300 transition-colors shadow-sm disabled:opacity-50"
                >
                  ✨ How to brush?
                </button>
                <button
                  onClick={() => questRef.current?.processAI("My teeth hurt")}
                  disabled={aiState.isThinking || aiState.isRecording}
                  className="px-3 py-1.5 bg-white border border-indigo-100 rounded-full text-xs font-semibold text-indigo-600 hover:bg-indigo-50 hover:border-indigo-300 transition-colors shadow-sm disabled:opacity-50"
                >
                  🩹 Teeth hurt!
                </button>
                <button
                  onClick={() => questRef.current?.processAI("I ate sugar today")}
                  disabled={aiState.isThinking || aiState.isRecording}
                  className="px-3 py-1.5 bg-white border border-indigo-100 rounded-full text-xs font-semibold text-indigo-600 hover:bg-indigo-50 hover:border-indigo-300 transition-colors shadow-sm disabled:opacity-50"
                >
                  🍬 Ate sugar!
                </button>
                <button
                  onClick={() => questRef.current?.processAI("Why is brushing important?")}
                  disabled={aiState.isThinking || aiState.isRecording}
                  className="px-3 py-1.5 bg-white border border-indigo-100 rounded-full text-xs font-semibold text-indigo-600 hover:bg-indigo-50 hover:border-indigo-300 transition-colors shadow-sm disabled:opacity-50"
                >
                  🛡️ Why brush?
                </button>
              </div>

            </div>
          </div>
        </div>

        {/* Instruction */}
        <div
          className="bg-white rounded-2xl p-5 border-2 border-purple-100"
          style={{
            boxShadow: '0 4px 12px rgba(124, 58, 237, 0.08)',
          }}
        >
          <p className="text-gray-700 leading-relaxed text-base">
            {currentStep.instruction}
          </p>
        </div>

        {/* Tips */}
        <div
          className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-5 border-2 border-amber-100"
        >
          <div className="flex items-center gap-2 mb-3">
            <Lightbulb className="w-5 h-5 text-amber-600" />
            <h3 className="font-bold text-gray-900">Pro Tips</h3>
          </div>
          <ul className="space-y-2">
            {currentStep.tips.map((tip, i) => (
              <li key={i} className="flex items-start gap-2 text-gray-700 text-sm">
                <span className="text-amber-600 font-bold">•</span>
                {tip}
              </li>
            ))}
          </ul>
        </div>

        {/* Step indicators */}
        <div className="grid grid-cols-4 gap-3 pt-2">
          {lessonSteps.map((_, i) => (
            <button
              key={i}
              onClick={() => setStep(i)}
              className={`aspect-square rounded-2xl flex flex-col items-center justify-center transition-all ${i < step
                ? 'bg-green-500 text-white'
                : i === step
                  ? 'bg-purple-600 text-white scale-110 shadow-lg animate-float'
                  : 'bg-gray-100 text-gray-400 hover:-translate-y-1'
                }`}
              style={{
                boxShadow: i <= step ? '0 4px 12px rgba(0,0,0,0.15)' : '0 2px 6px rgba(0,0,0,0.06)',
              }}
            >
              {i < step ? (
                <CheckCircle className="w-6 h-6" strokeWidth={2.5} />
              ) : (
                <span className="text-xl font-bold">{i + 1}</span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Action buttons */}
      <div className="bg-white border-t border-gray-100 p-5">
        <div className="flex gap-3">
          {step > 0 && (
            <button
              onClick={handlePrevious}
              className="flex-1 h-14 bg-gray-100 text-gray-700 rounded-2xl font-bold transition-all hover:bg-gray-200 active:scale-95 animate-float hover:-translate-y-1"
            >
              Previous
            </button>
          )}
          <button
            onClick={handleNext}
            className="flex-1 h-14 bg-gradient-to-r from-purple-600 to-purple-500 text-white rounded-2xl font-bold transition-all active:scale-95 flex items-center justify-center gap-2 animate-float hover:-translate-y-1 shadow-xl hover:shadow-2xl"
            style={{
              boxShadow: '0 6px 20px rgba(124, 58, 237, 0.3)',
            }}
          >
            {step < lessonSteps.length - 1 ? (
              <>
                Next Step
                <ArrowRight className="w-5 h-5" />
              </>
            ) : (
              'Complete Lesson'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
