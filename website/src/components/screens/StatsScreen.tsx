import React, { useState } from 'react';
import { ScreenProps } from './types';
import { ChevronLeft, TrendingUp, Clock, Target, Zap, Award, Calendar } from 'lucide-react';
import { AnimatedBackground } from '../AnimatedBackground';
import { useAuth } from '../../context/AuthContext';

export function StatsScreen({ navigateTo, userData }: ScreenProps) {
  const { currentUser } = useAuth();
  const [timePeriod, setTimePeriod] = useState<'week' | 'month' | 'year'>('week');

  const handleBack = () => {
    if (currentUser?.role === 'parent') navigateTo('parent-dashboard');
    else if (currentUser?.role === 'teacher') navigateTo('teacher-dashboard');
    else navigateTo('profile');
  };

  const weeklyChart = [
    { day: 'M', morning: 95, evening: 100 },
    { day: 'T', morning: 100, evening: 90 },
    { day: 'W', morning: 100, evening: 100 },
    { day: 'T', morning: 85, evening: 95 },
    { day: 'F', morning: 100, evening: 100 },
    { day: 'S', morning: 90, evening: 95 },
    { day: 'S', morning: 100, evening: 100 },
  ];

  return (
    <div className="h-full bg-gradient-to-b from-blue-50 to-white flex flex-col relative overflow-hidden">
      <AnimatedBackground />
      {/* Header */}
      <div className="sticky top-0 bg-white border-b border-gray-100 px-5 py-4 z-10 shadow-sm">
        <div className="flex items-center gap-3 mb-4">
          <button onClick={handleBack} className="p-2 -ml-2">
            <ChevronLeft className="w-6 h-6 text-gray-700" />
          </button>
          <h1 className="text-xl font-bold text-gray-900">Statistics</h1>
        </div>

        {/* Time period selector */}
        <div className="flex gap-2">
          {[
            { key: 'week', label: 'Week' },
            { key: 'month', label: 'Month' },
            { key: 'year', label: 'Year' },
          ].map((period) => (
            <button
              key={period.key}
              onClick={() => setTimePeriod(period.key as any)}
              className={`flex-1 h-10 rounded-xl text-sm font-bold transition-all ${timePeriod === period.key
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-gray-100 text-gray-600'
                }`}
            >
              {period.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-5 py-5 space-y-5">
        {/* Key metrics */}
        <div className="grid grid-cols-2 gap-3">
          {[
            { icon: TrendingUp, label: 'Total Sessions', value: userData.totalDays * 2, color: 'from-purple-400 to-purple-600' },
            { icon: Clock, label: 'Avg Duration', value: '2m 15s', color: 'from-blue-400 to-cyan-600' },
            { icon: Target, label: 'Success Rate', value: '92%', color: 'from-green-400 to-emerald-600' },
            { icon: Zap, label: 'Best Streak', value: '23 days', color: 'from-orange-400 to-pink-500' },
          ].map((metric, i) => {
            const Icon = metric.icon;
            return (
              <div key={i} className="bg-white rounded-3xl p-5 shadow-md">
                <div className={`w-12 h-12 bg-gradient-to-br ${metric.color} rounded-xl mb-3 flex items-center justify-center shadow-md`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-1">
                  {typeof metric.value === 'number' ? metric.value : metric.value}
                </div>
                <div className="text-xs text-gray-500">{metric.label}</div>
              </div>
            );
          })}
        </div>

        {/* Activity chart */}
        <div className="bg-white rounded-3xl p-5 shadow-md">
          <h3 className="font-bold text-gray-900 mb-4">Weekly Activity</h3>

          {/* Dual bar chart */}
          <div className="flex items-end justify-between gap-1.5 h-48 mb-4">
            {weeklyChart.map((day, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                <div className="flex-1 flex items-end w-full gap-0.5">
                  {/* Evening bar */}
                  <div
                    className="flex-1 bg-gradient-to-t from-purple-400 to-purple-500 rounded-t"
                    style={{ height: `${day.evening}%` }}
                  ></div>
                  {/* Morning bar */}
                  <div
                    className="flex-1 bg-gradient-to-t from-blue-400 to-blue-500 rounded-t"
                    style={{ height: `${day.morning}%` }}
                  ></div>
                </div>
                <span className="text-xs font-medium text-gray-500 mt-2">{day.day}</span>
              </div>
            ))}
          </div>

          {/* Legend */}
          <div className="flex items-center justify-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-gradient-to-br from-blue-400 to-blue-500 rounded"></div>
              <span className="text-xs text-gray-600">Morning</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-gradient-to-br from-purple-400 to-purple-500 rounded"></div>
              <span className="text-xs text-gray-600">Evening</span>
            </div>
          </div>
        </div>

        {/* Time distribution */}
        <div className="bg-white rounded-3xl p-5 shadow-md">
          <h3 className="font-bold text-gray-900 mb-4">Time Distribution</h3>

          {/* Pie chart representation */}
          <div className="flex items-center justify-center mb-5">
            <div className="relative w-36 h-36">
              <svg className="w-full h-full transform -rotate-90">
                <circle cx="72" cy="72" r="60" fill="none" stroke="#E5E7EB" strokeWidth="24" />
                <circle
                  cx="72"
                  cy="72"
                  r="60"
                  fill="none"
                  stroke="url(#gradient1)"
                  strokeWidth="24"
                  strokeDasharray={`${2 * Math.PI * 60 * 0.35} ${2 * Math.PI * 60 * 0.65}`}
                  strokeLinecap="round"
                />
                <circle
                  cx="72"
                  cy="72"
                  r="60"
                  fill="none"
                  stroke="url(#gradient2)"
                  strokeWidth="24"
                  strokeDasharray={`${2 * Math.PI * 60 * 0.50} ${2 * Math.PI * 60 * 0.50}`}
                  strokeDashoffset={`${-2 * Math.PI * 60 * 0.35}`}
                  strokeLinecap="round"
                />
                <defs>
                  <linearGradient id="gradient1" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#60A5FA" />
                    <stop offset="100%" stopColor="#3B82F6" />
                  </linearGradient>
                  <linearGradient id="gradient2" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#A78BFA" />
                    <stop offset="100%" stopColor="#8B5CF6" />
                  </linearGradient>
                </defs>
              </svg>
            </div>
          </div>

          <div className="space-y-2">
            {[
              { label: 'Morning', percent: '35%', color: 'from-blue-400 to-blue-500' },
              { label: 'Evening', percent: '50%', color: 'from-purple-400 to-purple-500' },
              { label: 'Afternoon', percent: '15%', color: 'from-gray-300 to-gray-400' },
            ].map((item, i) => (
              <div key={i} className="flex items-center justify-between p-2">
                <div className="flex items-center gap-3">
                  <div className={`w-4 h-4 bg-gradient-to-br ${item.color} rounded`}></div>
                  <span className="text-sm text-gray-700">{item.label}</span>
                </div>
                <span className="text-sm font-bold text-gray-900">{item.percent}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Performance metrics */}
        <div className="bg-white rounded-3xl p-5 shadow-md">
          <h3 className="font-bold text-gray-900 mb-4">Performance Breakdown</h3>
          <div className="space-y-4">
            {[
              { metric: 'Consistency', score: 95, color: 'from-green-400 to-emerald-500' },
              { metric: 'Technique', score: 88, color: 'from-blue-400 to-cyan-500' },
              { metric: 'Duration', score: 92, color: 'from-purple-400 to-purple-500' },
              { metric: 'Completion Rate', score: 85, color: 'from-pink-400 to-rose-500' },
            ].map((item, i) => (
              <div key={i}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">{item.metric}</span>
                  <span className="text-sm font-bold text-purple-600">{item.score}%</span>
                </div>
                <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full bg-gradient-to-r ${item.color} rounded-full transition-all duration-500`}
                    style={{ width: `${item.score}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Best records */}
        <div className="bg-gradient-to-br from-amber-500 to-orange-600 rounded-3xl p-5 text-white shadow-lg">
          <h3 className="font-bold mb-4">Personal Records</h3>
          <div className="space-y-3">
            {[
              { icon: Zap, label: 'Longest Streak', value: '23 days' },
              { icon: Award, label: 'Most Stars (Week)', value: '42 stars' },
              { icon: Calendar, label: 'Perfect Months', value: '2 months' },
            ].map((record, i) => {
              const Icon = record.icon;
              return (
                <div key={i} className="flex items-center justify-between bg-white/20 backdrop-blur-sm rounded-xl p-3">
                  <div className="flex items-center gap-3">
                    <Icon className="w-5 h-5" />
                    <span className="text-sm">{record.label}</span>
                  </div>
                  <span className="font-bold">{record.value}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
