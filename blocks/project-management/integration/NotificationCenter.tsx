import React, { useState, useEffect } from 'react';
import { Notification, NotificationGroup, groupNotifications } from './notifications';

interface NotificationCenterProps {
  notifications: Notification[];
  onNotificationClick: (notification: Notification) => void;
  onNotificationAction: (notification: Notification, action: string) => void;
  syncStatus: SyncState;
  onSyncRetry: () => void;
  items: BaseItem[];
}

export const NotificationCenter: React.FC<NotificationCenterProps> = ({
  notifications,
  onNotificationClick,
  onNotificationAction,
  syncStatus,
  onSyncRetry
}) => {
  const [showUnreadOnly, setShowUnreadOnly] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null);
  const [groupedNotifications, setGroupedNotifications] = useState<NotificationGroup[]>([]);

  useEffect(() => {
    const filteredNotifications = showUnreadOnly
      ? notifications.filter(n => !n.isRead)
      : notifications;
    setGroupedNotifications(groupNotifications(filteredNotifications));
  }, [notifications, showUnreadOnly]);

  const handleNotificationClick = (notification: Notification) => {
    onNotificationClick(notification);
  };

  const handleAction = (notification: Notification, action: string) => {
    onNotificationAction(notification, action);
  };

  const getPriorityColor = (priority: Notification['priority']) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 border-red-500';
      case 'high': return 'bg-orange-100 border-orange-500';
      case 'medium': return 'bg-yellow-100 border-yellow-500';
      case 'low': return 'bg-blue-100 border-blue-500';
      default: return 'bg-gray-100 border-gray-500';
    }
  };

  const getTypeIcon = (type: Notification['type']) => {
    switch (type) {
      case 'error': return '❌';
      case 'warning': return '⚠️';
      case 'success': return '✅';
      case 'info': return 'ℹ️';
      default: return '📌';
    }
  };

  const renderNotificationGroup = (group: NotificationGroup) => {
    const isExpanded = selectedGroup === group.id;
    const hasUnread = group.notifications.some(n => !n.isRead);
    const hasActionRequired = group.notifications.some(n => n.actionRequired);

    return (
      <div
        key={group.id}
        className={`mb-4 rounded-lg shadow-sm ${
          hasUnread ? 'bg-white' : 'bg-gray-50'
        }`}
      >
        <div
          className={`p-4 cursor-pointer ${
            hasActionRequired ? 'border-l-4 border-red-500' : ''
          }`}
          onClick={() => setSelectedGroup(isExpanded ? null : group.id)}
        >
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <span className="text-lg">{getTypeIcon(group.type)}</span>
              <h3 className="font-semibold">{group.title}</h3>
              {hasUnread && (
                <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                  Yeni
                </span>
              )}
            </div>
            <div className="flex items-center space-x-2">
              <span className={`px-2 py-1 text-xs rounded-full ${getPriorityColor(group.priority)}`}>
                {group.priority}
              </span>
              <span className="text-gray-500 text-sm">
                {group.notifications.length} bildirim
              </span>
            </div>
          </div>
        </div>

        {isExpanded && (
          <div className="px-4 pb-4 space-y-2">
            {group.notifications.map(notification => (
              <div
                key={notification.id}
                className={`p-3 rounded-lg ${
                  notification.isRead ? 'bg-gray-50' : 'bg-white'
                }`}
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <p className="text-sm text-gray-600">{notification.description}</p>
                    {notification.actionRequired && (
                      <div className="mt-2 flex items-center space-x-2">
                        <span className="text-xs text-red-600">Aksiyon Gerekli</span>
                        {notification.actionDeadline && (
                          <span className="text-xs text-gray-500">
                            Son Tarih: {new Date(notification.actionDeadline).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center space-x-2">
                    {notification.actionRequired && notification.actionType && (
                      <button
                        onClick={() => handleAction(notification, notification.actionType!)}
                        className="px-3 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600"
                      >
                        {notification.actionType === 'approval' ? 'Onayla' :
                         notification.actionType === 'review' ? 'İncele' :
                         notification.actionType === 'update' ? 'Güncelle' :
                         'Onayla'}
                      </button>
                    )}
                    <button
                      onClick={() => handleNotificationClick(notification)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      →
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  const renderSyncStatus = () => {
    if (!syncStatus) return null;

    const getSyncStatusColor = () => {
      if (syncStatus.offlineMode) return 'text-gray-500';
      switch (syncStatus.status) {
        case 'syncing': return 'text-blue-500';
        case 'error': return 'text-red-500';
        default: return 'text-green-500';
      }
    };

    const getSyncStatusIcon = () => {
      if (syncStatus.offlineMode) return '📴';
      switch (syncStatus.status) {
        case 'syncing': return '🔄';
        case 'error': return '⚠️';
        default: return '✅';
      }
    };

    const getSyncStatusText = () => {
      if (syncStatus.offlineMode) return 'Çevrimdışı Mod';
      switch (syncStatus.status) {
        case 'syncing': return 'Senkronize Ediliyor...';
        case 'error': return 'Senkronizasyon Hatası';
        default: return 'Senkronize Edildi';
      }
    };

    return (
      <div className="flex items-center space-x-2 text-sm">
        <div className="flex items-center space-x-2">
          <span className={getSyncStatusColor()}>
            {getSyncStatusIcon()} {getSyncStatusText()}
          </span>
          {syncStatus.pendingChanges && syncStatus.pendingChanges > 0 && (
            <span className="px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded-full">
              {syncStatus.pendingChanges} Bekleyen Değişiklik
            </span>
          )}
        </div>
        {syncStatus.lastSync && !syncStatus.offlineMode && (
          <span className="text-gray-500">
            Son: {new Date(syncStatus.lastSync).toLocaleTimeString()}
          </span>
        )}
        {syncStatus.status === 'error' && onSyncRetry && !syncStatus.offlineMode && (
          <button
            onClick={onSyncRetry}
            className="text-blue-500 hover:text-blue-600 text-sm"
          >
            Tekrar Dene
          </button>
        )}
      </div>
    );
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-4">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center space-x-4">
          <h2 className="text-xl font-semibold">Bildirimler</h2>
          {renderSyncStatus()}
        </div>
        <div className="flex items-center space-x-2">
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={showUnreadOnly}
              onChange={e => setShowUnreadOnly(e.target.checked)}
              className="form-checkbox h-4 w-4 text-blue-600"
            />
            <span className="text-sm text-gray-600">Sadece Okunmamışlar</span>
          </label>
        </div>
      </div>

      <div className="space-y-4">
        {groupedNotifications.length > 0 ? (
          groupedNotifications.map(renderNotificationGroup)
        ) : (
          <div className="text-center py-8 text-gray-500">
            Bildirim bulunmuyor
          </div>
        )}
      </div>
    </div>
  );
}; 