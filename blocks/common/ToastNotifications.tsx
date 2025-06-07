'use client';

import React, { useEffect, useState } from 'react';
import { notificationService, Notification } from './services/notificationService';

export function ToastNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    const update = (notification: Notification) => {
      setNotifications(current => [...current, notification]);
      setTimeout(() => {
        setNotifications(current => current.filter(n => n.id !== notification.id));
      }, 5000);
    };
    const unsubscribe = notificationService.subscribe(update);
    return () => unsubscribe();
  }, []);

  const getColor = (type: Notification['type']) => {
    switch (type) {
      case 'success': return 'bg-green-600';
      case 'error': return 'bg-red-600';
      case 'warning': return 'bg-yellow-500';
      default: return 'bg-gray-800';
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-[100] flex flex-col space-y-2 items-end">
      {notifications.map(n => (
        <div
          key={n.id}
          className={`min-w-[220px] max-w-xs px-4 py-3 rounded shadow-lg text-white ${getColor(n.type)} animate-fade-in-up`}
        >
          <div className="flex items-center justify-between">
            <span className="font-medium capitalize">{n.type}</span>
            <button
              className="ml-2 text-white/70 hover:text-white text-xs"
              onClick={() => setNotifications(current => current.filter(x => x.id !== n.id))}
            >
              ✕
            </button>
          </div>
          <div className="mt-1 text-sm">{n.message}</div>
        </div>
      ))}
      <style>{`
        @keyframes fade-in-up {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-up {
          animation: fade-in-up 0.3s ease;
        }
      `}</style>
    </div>
  );
} 