'use client';

import React, { useEffect, useState } from 'react';
import { notificationService } from './services/notificationService';

interface NotificationPreferences {
  criticalErrors: boolean;
  issueUpdates: boolean;
  statusChanges: boolean;
  mlAlerts: boolean;
}

const DEFAULT_PREFERENCES: NotificationPreferences = {
  criticalErrors: true,
  issueUpdates: true,
  statusChanges: true,
  mlAlerts: true,
};

export function NotificationPreferences() {
  const [preferences, setPreferences] = useState<NotificationPreferences>(DEFAULT_PREFERENCES);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const savedPreferences = localStorage.getItem('notificationPreferences');
    if (savedPreferences) {
      setPreferences(JSON.parse(savedPreferences));
    }
  }, []);

  const handleToggle = (key: keyof NotificationPreferences) => {
    const newPreferences = {
      ...preferences,
      [key]: !preferences[key],
    };
    setPreferences(newPreferences);
    localStorage.setItem('notificationPreferences', JSON.stringify(newPreferences));
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 text-gray-600 hover:text-gray-800"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg p-4 z-50">
          <h3 className="text-lg font-semibold mb-4">Bildirim Ayarları</h3>
          <div className="space-y-3">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={preferences.criticalErrors}
                onChange={() => handleToggle('criticalErrors')}
                className="rounded text-blue-600"
              />
              <span className="text-sm">Kritik Hatalar</span>
            </label>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={preferences.issueUpdates}
                onChange={() => handleToggle('issueUpdates')}
                className="rounded text-blue-600"
              />
              <span className="text-sm">Issue Güncellemeleri</span>
            </label>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={preferences.statusChanges}
                onChange={() => handleToggle('statusChanges')}
                className="rounded text-blue-600"
              />
              <span className="text-sm">Durum Değişiklikleri</span>
            </label>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={preferences.mlAlerts}
                onChange={() => handleToggle('mlAlerts')}
                className="rounded text-blue-600"
              />
              <span className="text-sm">ML Uyarıları</span>
            </label>
          </div>
        </div>
      )}
    </div>
  );
} 