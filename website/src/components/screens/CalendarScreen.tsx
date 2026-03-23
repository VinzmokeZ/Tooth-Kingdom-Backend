import React from 'react';
import { ScreenProps } from './types';
import { ChevronLeft, ChevronRight, Check, Flame } from 'lucide-react';

export function CalendarScreen({ navigateTo, userData }: ScreenProps) {
  const [currentDate, setCurrentDate] = React.useState(new Date());

  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const startDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  // Extract completed days from real brushing logs
  const completedDays = (Object.entries(userData.brushingLogs) as [string, { morning: boolean; evening: boolean }][])
    .filter(([date, status]) => {
      const logDate = new Date(date);
      return (
        logDate.getMonth() === currentDate.getMonth() &&
        logDate.getFullYear() === currentDate.getFullYear() &&
        (status.morning || status.evening)
      );
    })
    .map(([date]) => new Date(date).getDate());

  const currentDay = new Date().getDate();
  const isCurrentMonth = new Date().getMonth() === currentDate.getMonth() && new Date().getFullYear() === currentDate.getFullYear();

  return (
    <div className="h-full bg-gradient-to-b from-green-50 to-white flex flex-col">
      {/* Header */}
      <div className="sticky top-0 bg-white border-b border-gray-100 px-5 py-4 z-10 shadow-sm">
        <div className="flex items-center gap-3 mb-4">
          <button onClick={() => navigateTo('dashboard')} className="p-2 -ml-2">
            <ChevronLeft className="w-6 h-6 text-gray-700" />
          </button>
          <h1 className="text-xl font-bold text-gray-900">Activity Calendar</h1>
        </div>

        {/* Month selector */}
        <div className="flex items-center justify-between bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl px-4 py-3 text-white">
          <button onClick={prevMonth} className="p-1 hover:bg-white/20 rounded-full transition-colors">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <span className="font-bold text-lg select-none">
            {new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric' }).format(currentDate)}
          </span>
          <button onClick={nextMonth} className="p-1 hover:bg-white/20 rounded-full transition-colors">
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-5 py-5 space-y-5">
        {/* Calendar */}
        <div className="bg-white rounded-3xl p-5 shadow-md">
          {/* Day labels */}
          <div className="grid grid-cols-7 gap-2 mb-3">
            {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, i) => (
              <div key={i} className="text-center text-gray-500 text-xs font-bold py-2">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar grid */}
          <div className="grid grid-cols-7 gap-2">
            {/* Empty cells for offset */}
            {[...Array(startDay)].map((_, i) => (
              <div key={`empty-${i}`} className="aspect-square"></div>
            ))}

            {/* Days */}
            {[...Array(daysInMonth)].map((_, i) => {
              const day = i + 1;
              const isCompleted = completedDays.includes(day);
              const isToday = isCurrentMonth && day === currentDay;

              return (
                <button
                  key={day}
                  className={`aspect-square rounded-xl flex items-center justify-center relative transition-all ${isToday
                    ? 'bg-gradient-to-br from-green-500 to-emerald-600 text-white font-bold shadow-md scale-110'
                    : isCompleted
                      ? 'bg-green-100 text-green-700 font-medium'
                      : 'bg-gray-50 text-gray-400'
                    }`}
                >
                  <span className="text-sm">{day}</span>
                  {isCompleted && !isToday && (
                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                      <Check className="w-3 h-3 text-white" strokeWidth={3} />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Stats summary */}
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-3xl p-5 text-white shadow-lg">
          <h3 className="font-bold mb-4">This Month</h3>
          <div className="grid grid-cols-3 gap-3">
            <div className="text-center bg-white/20 backdrop-blur-sm rounded-xl p-3">
              <div className="text-3xl font-bold">{completedDays.length}</div>
              <div className="text-xs opacity-90 mt-1">Days Complete</div>
            </div>
            <div className="text-center bg-white/20 backdrop-blur-sm rounded-xl p-3">
              <div className="text-3xl font-bold">{userData.currentStreak}</div>
              <div className="text-xs opacity-90 mt-1">Current Streak</div>
            </div>
            <div className="text-center bg-white/20 backdrop-blur-sm rounded-xl p-3">
              <div className="text-3xl font-bold">{Math.round((completedDays.length / currentDay) * 100)}%</div>
              <div className="text-xs opacity-90 mt-1">Success Rate</div>
            </div>
          </div>
        </div>

        {/* Recent activity */}
        <div className="bg-white rounded-3xl p-5 shadow-md">
          <h3 className="font-bold text-gray-900 mb-4">Recent Activity</h3>
          <div className="space-y-3">
            {(Object.entries(userData.brushingLogs) as [string, { morning: boolean; evening: boolean }][])
              .sort((a, b) => new Date(b[0]).getTime() - new Date(a[0]).getTime())
              .slice(0, 4)
              .map(([date, status], i) => (
                <div key={i} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${status.morning && status.evening
                    ? 'bg-green-500'
                    : 'bg-blue-400'
                    }`}>
                    <Check className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900 text-sm">
                      {status.morning && status.evening ? 'Full Day Completed' : 'Partial Session'}
                    </h4>
                    <p className="text-xs text-gray-500">{new Date(date).toLocaleDateString()}</p>
                  </div>
                </div>
              ))}
          </div>
        </div>

        {/* Streak info */}
        <div className="bg-gradient-to-br from-orange-400 to-pink-500 rounded-3xl p-5 text-white shadow-lg">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
              <Flame className="w-8 h-8 fill-white" />
            </div>
            <div>
              <h3 className="font-bold text-lg">Keep Your Streak!</h3>
              <p className="text-sm opacity-90">Don't break the chain</p>
            </div>
          </div>
          <p className="text-sm opacity-90">
            You're on a {userData.currentStreak}-day streak! Brush tonight to keep it going. 🌟
          </p>
        </div>
      </div>
    </div>
  );
}
