import React from 'react';
import { ScreenProps } from './types';
import { ChevronLeft, Flame, Trophy, Calendar, Target, TrendingUp } from 'lucide-react';

export function StreakScreen({ navigateTo, userData }: ScreenProps) {
  const now = new Date();
  const weekDays = [...Array(7)].map((_, i) => {
    const d = new Date();
    d.setDate(now.getDate() - (6 - i));
    const dateStr = d.toISOString().split('T')[0];
    const log = (userData.brushingLogs as any)[dateStr];
    return {
      day: d.toLocaleDateString('en-US', { weekday: 'short' }),
      date: d.getDate(),
      completed: log ? (log.morning || log.evening) : false
    };
  });

  const streakHistory = [30, 50, 70, 60, 80, 75, 90, 100, 85, 95, 88, 92]; // Keeping visual chart for now

  return (
    <div className="h-full bg-gradient-to-b from-orange-50 to-white flex flex-col">
      {/* Header */}
      <div className="sticky top-0 bg-white border-b border-gray-100 px-5 py-4 z-10 shadow-sm">
        <div className="flex items-center gap-3">
          <button onClick={() => navigateTo('dashboard')} className="p-2 -ml-2">
            <ChevronLeft className="w-6 h-6 text-gray-700" />
          </button>
          <h1 className="text-xl font-bold text-gray-900">Streak Details</h1>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-5 py-5 space-y-5">
        {/* Current streak showcase */}
        <div className="bg-gradient-to-br from-orange-400 via-pink-500 to-purple-600 rounded-3xl p-8 text-white shadow-xl text-center">
          <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
            <Flame className="w-12 h-12 fill-white" />
          </div>
          <div className="text-6xl font-bold mb-2">{userData.currentStreak}</div>
          <h3 className="text-xl font-bold mb-2">Day Streak!</h3>
          <p className="text-white/90 text-sm">
            You're on fire! Keep brushing daily to maintain your streak
          </p>
        </div>

        {/* This week tracker */}
        <div className="bg-white rounded-3xl p-5 shadow-md">
          <h3 className="font-bold text-gray-900 mb-4">This Week</h3>

          <div className="grid grid-cols-7 gap-2">
            {weekDays.map((day, i) => (
              <div key={i} className="text-center">
                <div className="text-xs text-gray-500 mb-2 font-medium">{day.day}</div>
                <div
                  className={`aspect-square rounded-2xl flex flex-col items-center justify-center transition-all ${day.completed
                    ? 'bg-gradient-to-br from-orange-400 to-pink-500 text-white shadow-md'
                    : 'bg-gray-100 text-gray-400'
                    }`}
                >
                  {day.completed ? (
                    <Flame className="w-6 h-6 fill-current" />
                  ) : (
                    <span className="text-sm font-bold">{day.date}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Streak stats */}
        <div className="grid grid-cols-2 gap-3">
          {[
            { icon: Trophy, label: 'Best Streak', value: `${userData.bestStreak} days`, color: 'from-amber-400 to-orange-500' },
            { icon: Calendar, label: 'Total Days', value: `${userData.totalDays} days`, color: 'from-green-400 to-emerald-500' },
          ].map((stat, i) => {
            const Icon = stat.icon;
            return (
              <div key={i} className="bg-white rounded-3xl p-5 shadow-md text-center">
                <div className={`w-14 h-14 bg-gradient-to-br ${stat.color} rounded-2xl mb-3 flex items-center justify-center mx-auto shadow-md`}>
                  <Icon className="w-7 h-7 text-white" />
                </div>
                <div className="text-2xl font-bold text-gray-900 mb-1">{stat.value}</div>
                <div className="text-xs text-gray-500">{stat.label}</div>
              </div>
            );
          })}
        </div>

        {/* Streak history chart */}
        <div className="bg-white rounded-3xl p-5 shadow-md">
          <h3 className="font-bold text-gray-900 mb-4">Streak History</h3>

          {/* Area chart */}
          <div className="h-40 flex items-end justify-between gap-1 mb-4">
            {streakHistory.map((value, i) => (
              <div
                key={i}
                className="flex-1 bg-gradient-to-t from-orange-400 to-pink-500 rounded-t transition-all"
                style={{ height: `${value}%` }}
              ></div>
            ))}
          </div>

          <div className="flex justify-between text-xs text-gray-500">
            <span>12 weeks ago</span>
            <span>Now</span>
          </div>
        </div>

        {/* Milestones */}
        <div className="bg-white rounded-3xl p-5 shadow-md">
          <h3 className="font-bold text-gray-900 mb-4">Streak Milestones</h3>

          <div className="space-y-3">
            {[
              { days: 3, title: '3-Day Starter', completed: true },
              { days: 7, title: 'Week Warrior', completed: true },
              { days: 14, title: 'Two-Week Champion', completed: false, progress: 50 },
              { days: 30, title: 'Monthly Master', completed: false, progress: 23 },
              { days: 100, title: 'Century Legend', completed: false, progress: 7 },
            ].map((milestone, i) => {
              return (
                <div
                  key={i}
                  className={`flex items-center gap-4 p-4 rounded-2xl transition-all ${milestone.completed
                    ? 'bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-200'
                    : 'bg-gray-50'
                    }`}
                >
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 ${milestone.completed
                    ? 'bg-gradient-to-br from-amber-400 to-orange-500 text-white shadow-md'
                    : 'bg-white text-gray-400 border-2 border-gray-200'
                    }`}>
                    {milestone.completed ? (
                      <Trophy className="w-7 h-7 fill-current" />
                    ) : (
                      <span className="text-xl font-bold">{milestone.days}</span>
                    )}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-gray-900 text-sm mb-1">{milestone.title}</h4>
                    {milestone.completed ? (
                      <span className="text-xs text-green-600 font-medium">✓ Achieved</span>
                    ) : (
                      <div>
                        <div className="h-2 bg-gray-200 rounded-full overflow-hidden mb-1">
                          <div
                            className="h-full bg-gradient-to-r from-orange-400 to-pink-500 rounded-full"
                            style={{ width: `${milestone.progress}%` }}
                          ></div>
                        </div>
                        <span className="text-xs text-gray-500">{userData.currentStreak}/{milestone.days} days</span>
                      </div>
                    )}
                  </div>
                  {!milestone.completed && <Target className="w-5 h-5 text-gray-300" />}
                </div>
              );
            })}
          </div>
        </div>

        {/* Motivation card */}
        <div className="bg-gradient-to-br from-purple-500 to-pink-600 rounded-3xl p-6 text-white shadow-lg">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
              <TrendingUp className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-lg">Keep Going!</h3>
          </div>
          <p className="text-white/90 text-sm leading-relaxed mb-4">
            You're just 7 days away from your next milestone. Don't break the chain - every day counts!
          </p>
          <button
            onClick={() => navigateTo('brushing-lesson')}
            className="w-full h-12 bg-white text-purple-600 rounded-2xl font-bold shadow-lg hover:shadow-xl transition-all"
          >
            Brush Now
          </button>
        </div>
      </div>
    </div>
  );
}
