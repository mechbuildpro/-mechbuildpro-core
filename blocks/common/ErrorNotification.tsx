'use client';

import React, { useMemo, useState } from 'react';
import { errorLogger, ErrorLog } from './services/errorLogger';

interface ErrorNotificationProps {
  timeRange: '1h' | '6h' | '24h' | '7d';
}

interface Notification {
  id: string;
  type: 'error' | 'warning' | 'info' | 'success';
  title: string;
  message: string;
  timestamp: string;
  severity: 'high' | 'medium' | 'low';
  component?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  status: 'active' | 'resolved' | 'ignored';
}

export function ErrorNotification({ timeRange }: ErrorNotificationProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const logs = errorLogger.getRecentLogs();

  const timeRangeMs = useMemo(() => {
    const now = Date.now();
    switch (timeRange) {
      case '1h': return now - 60 * 60 * 1000;
      case '6h': return now - 6 * 60 * 60 * 1000;
      case '24h': return now - 24 * 60 * 60 * 1000;
      case '7d': return now - 7 * 24 * 60 * 60 * 1000;
    }
  }, [timeRange]);

  // Process logs and generate notifications
  useMemo(() => {
    const filteredLogs = logs.filter(log => 
      new Date(log.timestamp).getTime() >= timeRangeMs
    );

    const newNotifications: Notification[] = [];

    filteredLogs.forEach(log => {
      // Skip if notification already exists
      if (notifications.some(n => n.id === log.id)) return;

      let type: Notification['type'] = 'error';
      let severity: Notification['severity'] = 'medium';
      let title = 'Hata Tespit Edildi';
      let message = log.message;

      // Determine notification type and severity
      if (log.severity === 'error') {
        type = 'error';
        severity = 'high';
      } else if (log.severity === 'warning') {
        type = 'warning';
        severity = 'medium';
      } else {
        type = 'info';
        severity = 'low';
      }

      // Generate specific messages based on error type
      if (log.message.toLowerCase().includes('network')) {
        title = 'Ağ Bağlantı Sorunu';
        message = 'Ağ bağlantısında kesinti tespit edildi. Sistem otomatik olarak yedek bağlantıya geçiş yapıyor.';
      } else if (log.message.toLowerCase().includes('validation')) {
        title = 'Doğrulama Hatası';
        message = 'Veri doğrulama hatası tespit edildi. Lütfen giriş verilerini kontrol edin.';
      } else if (log.message.toLowerCase().includes('resource')) {
        title = 'Kaynak Kullanım Uyarısı';
        message = 'Sistem kaynakları yüksek kullanımda. Performans optimizasyonu önerilir.';
      }

      // Add resolution action if available
      const action = log.status === 'active' ? {
        label: 'Çözümü Görüntüle',
        onClick: () => {
          // Handle resolution view
          console.log('View resolution for:', log.id);
        }
      } : undefined;

      newNotifications.push({
        id: log.id,
        type,
        title,
        message,
        timestamp: log.timestamp,
        severity,
        component: log.component,
        action,
        status: log.status
      });
    });

    setNotifications(prev => [...newNotifications, ...prev]);
  }, [logs, timeRangeMs]);

  const getTypeColor = (type: Notification['type']) => {
    switch (type) {
      case 'error': return 'bg-red-100 text-red-800 border-red-200';
      case 'warning': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'info': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'success': return 'bg-green-100 text-green-800 border-green-200';
    }
  };

  const getSeverityIcon = (severity: Notification['severity']) => {
    switch (severity) {
      case 'high': return '🔴';
      case 'medium': return '🟡';
      case 'low': return '🟢';
    }
  };

  const handleDismiss = (id: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, status: 'ignored' } : n)
    );
  };

  const handleResolve = (id: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, status: 'resolved' } : n)
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium text-gray-700">Bildirimler</h4>
        <span className="text-xs text-gray-500">
          {notifications.filter(n => n.status === 'active').length} aktif
        </span>
      </div>

      <div className="space-y-2">
        {notifications
          .filter(n => n.status !== 'ignored')
          .map(notification => (
            <div
              key={notification.id}
              className={`rounded-lg border p-4 ${getTypeColor(notification.type)}`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3">
                  <span className="text-lg">{getSeverityIcon(notification.severity)}</span>
                  <div>
                    <h5 className="text-sm font-medium">{notification.title}</h5>
                    <p className="text-sm mt-1">{notification.message}</p>
                    {expandedId === notification.id && (
                      <div className="mt-2 space-y-2">
                        <div className="text-xs text-gray-600">
                          Bileşen: {notification.component || 'Bilinmiyor'}
                        </div>
                        <div className="text-xs text-gray-600">
                          Zaman: {new Date(notification.timestamp).toLocaleString()}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {notification.status === 'active' && (
                    <>
                      <button
                        onClick={() => handleResolve(notification.id)}
                        className="text-xs text-gray-600 hover:text-gray-900"
                      >
                        Çözüldü
                      </button>
                      <button
                        onClick={() => handleDismiss(notification.id)}
                        className="text-xs text-gray-600 hover:text-gray-900"
                      >
                        Gizle
                      </button>
                    </>
                  )}
                  <button
                    onClick={() => setExpandedId(
                      expandedId === notification.id ? null : notification.id
                    )}
                    className="text-xs text-gray-600 hover:text-gray-900"
                  >
                    {expandedId === notification.id ? 'Daralt' : 'Genişlet'}
                  </button>
                </div>
              </div>
              {notification.action && notification.status === 'active' && (
                <div className="mt-3">
                  <button
                    onClick={notification.action.onClick}
                    className="text-xs font-medium text-blue-600 hover:text-blue-800"
                  >
                    {notification.action.label}
                  </button>
                </div>
              )}
            </div>
          ))}

        {notifications.length === 0 && (
          <div className="text-center py-8">
            <p className="text-sm text-gray-500">
              Aktif bildirim bulunmuyor.
            </p>
          </div>
        )}
      </div>
    </div>
  );
} 