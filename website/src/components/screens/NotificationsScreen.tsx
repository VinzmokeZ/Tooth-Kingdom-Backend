import React, { useState } from 'react';
import { AppNotification, ScreenProps } from './types';
import { ChevronLeft, Bell, Award, Calendar, Star, Flame, Trophy } from 'lucide-react';
import { AnimatedBackground } from '../AnimatedBackground';


export function NotificationsScreen({ navigateTo, userData, updateUserData }: ScreenProps) {
  const [activeTab, setActiveTab] = useState<'all' | 'unread'>('all');
  const [selectedNotification, setSelectedNotification] = useState<AppNotification | null>(null);

  const notifications = userData.notifications || [];

  const handleNotificationClick = (id: number) => {
    const notification = notifications.find(n => n.id === id);
    if (notification) {
      if (!notification.read) {
        const updated = notifications.map(n => n.id === id ? { ...n, read: true } : n);
        updateUserData({ notifications: updated });
      }
      setSelectedNotification(notification);
    }
  };

  const markAllAsRead = () => {
    const updated = notifications.map(n => ({ ...n, read: true }));
    updateUserData({ notifications: updated });
  };

  const filteredNotifications = activeTab === 'unread'
    ? notifications.filter(n => !n.read)
    : notifications;

  const unreadCount = notifications.filter(n => !n.read).length;

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'Bell': return Bell;
      case 'Award': return Award;
      case 'Calendar': return Calendar;
      case 'Star': return Star;
      case 'Flame': return Flame;
      case 'Trophy': return Trophy;
      default: return Bell;
    }
  };

  return (
    <div className="h-full bg-gradient-to-b from-blue-50 to-white flex flex-col relative overflow-hidden">
      <AnimatedBackground />
      {/* Header */}
      <div className="sticky top-0 bg-white border-b border-gray-100 px-5 py-4 z-10 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <button onClick={() => navigateTo('dashboard')} className="p-2 -ml-2 hover:bg-gray-50 rounded-full transition-colors">
            <ChevronLeft className="w-6 h-6 text-gray-700" />
          </button>
          <h1 className="text-xl font-bold text-gray-900 flex-1 text-center">Notifications</h1>
          <button
            onClick={markAllAsRead}
            className="text-purple-600 text-sm font-medium hover:text-purple-700 active:scale-95 transition-transform"
          >
            Mark all
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab('all')}
            className={`flex-1 h-10 rounded-xl text-sm font-bold transition-all ${activeTab === 'all'
              ? 'bg-purple-600 text-white shadow-md'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
          >
            All
          </button>
          <button
            onClick={() => setActiveTab('unread')}
            className={`flex-1 h-10 rounded-xl text-sm font-bold transition-all relative ${activeTab === 'unread'
              ? 'bg-purple-600 text-white shadow-md'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
          >
            Unread
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-pink-500 text-white text-xs rounded-full flex items-center justify-center font-bold animate-pulse">
                {unreadCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {filteredNotifications.map((notification) => {
          const Icon = getIcon(notification.iconName);
          return (
            <button
              key={notification.id}
              onClick={() => handleNotificationClick(notification.id)}
              className={`w-full flex items-start gap-4 p-5 border-b border-gray-100 hover:bg-gray-50 transition-colors text-left ${!notification.read ? 'bg-blue-50/50' : ''
                }`}
            >
              {/* Icon */}
              <div className={`w-14 h-14 bg-gradient-to-br ${notification.color} rounded-2xl flex items-center justify-center flex-shrink-0 shadow-md`}>
                <Icon className="w-7 h-7 text-white" />
              </div>

              {/* Content */}
              <div className="flex-1">
                <div className="flex justify-between items-start mb-1">
                  <h3 className={`font-bold text-gray-900 ${!notification.read ? 'text-blue-900' : ''}`}>
                    {notification.title}
                  </h3>
                  <span className="text-xs text-gray-400 whitespace-nowrap ml-2">{notification.time}</span>
                </div>
                <p className="text-sm text-gray-600 leading-relaxed mb-2 line-clamp-2">
                  {notification.message}
                </p>
              </div>

              {/* Unread indicator */}
              {!notification.read && (
                <div className="w-3 h-3 bg-purple-600 rounded-full mt-2 flex-shrink-0 shadow-sm"></div>
              )}
            </button>
          );
        })}

        {filteredNotifications.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 px-8">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <Bell className="w-12 h-12 text-gray-300" />
            </div>
            <h3 className="font-bold text-gray-900 mb-2">All Caught Up!</h3>
            <p className="text-sm text-gray-500 text-center">
              You have no unread notifications
            </p>
          </div>
        )}
      </div>

      {/* Notification Detail Overlay */}
      {selectedNotification && (
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-sm rounded-3xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
            {/* Header / Banner */}
            <div className={`h-32 bg-gradient-to-br ${selectedNotification.color} flex items-center justify-center relative`}>
              <button
                onClick={() => setSelectedNotification(null)}
                className="absolute top-4 left-4 w-10 h-10 bg-black/20 hover:bg-black/30 backdrop-blur rounded-full flex items-center justify-center text-white transition-colors"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              {(() => {
                const Icon = getIcon(selectedNotification.iconName);
                return <Icon className="w-16 h-16 text-white drop-shadow-lg" />;
              })()}
            </div>

            {/* Body */}
            <div className="p-6">
              <span className="inline-block px-3 py-1 rounded-full bg-gray-100 text-gray-500 text-xs font-bold mb-3 uppercase tracking-wider">
                {selectedNotification.type}
              </span>
              <h2 className="text-2xl font-black text-gray-900 mb-2 leading-tight">
                {selectedNotification.title}
              </h2>
              <span className="text-sm text-gray-400 block mb-4">
                Received {selectedNotification.time}
              </span>
              <p className="text-gray-600 leading-relaxed text-lg mb-8">
                {selectedNotification.message}
              </p>

              {/* Actions */}
              <div className="space-y-3">
                <button
                  onClick={() => {
                    // Action based on type
                    if (selectedNotification.type === 'game') navigateTo('chapters');
                    else if (selectedNotification.type === 'achievement') navigateTo('profile'); // Assuming profile has achievements
                    else navigateTo('dashboard');
                    setSelectedNotification(null);
                  }}
                  className={`w-full py-4 rounded-xl font-bold text-white shadow-lg bg-gradient-to-r ${selectedNotification.color} active:scale-95 transition-transform`}
                >
                  {selectedNotification.type === 'achievement' ? 'View Achievement' :
                    selectedNotification.type === 'reward' ? 'Claim Reward' :
                      'Open Now'}
                </button>
                <button
                  onClick={() => setSelectedNotification(null)}
                  className="w-full py-4 rounded-xl font-bold text-gray-500 hover:bg-gray-50 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
