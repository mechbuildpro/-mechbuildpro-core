import React, { useState, useEffect, useMemo, lazy, Suspense, useCallback } from 'react';
import { useIntegrationManagement, BaseItem, SystemDependency, IntegrationTest, CommissioningPlan, SystemTransition, IntegrationData, SyncState } from './logic';
import { exportAllReports } from './export';
import { FilterOptions, quickFilters, filterItems, saveFilter, loadFilter, getSavedFilterNames, deleteFilter } from './filters';
import { Dashboard } from './visualization';
import { NotificationCenter } from './NotificationCenter';
import { Notification } from './notifications';
import { WorkflowAction, createWorkflowAction } from './workflow';

// Lazy load the ExportComponent using relative path
const LazyExportComponent = lazy(() => import('../../reporting/exports/Component'));

interface IntegrationManagementProps {
  projectId: string;
  onIntegrationUpdate?: (integrationData: IntegrationData) => void;
  notifications: Notification[];
  onNotificationAction: (notification: Notification, action: string) => void;
}

// Sorting options
type SortKey = keyof BaseItem | 'none';
type SortOrder = 'asc' | 'desc';

export const IntegrationManagement: React.FC<IntegrationManagementProps> = ({
  projectId,
  onIntegrationUpdate,
  notifications,
  onNotificationAction
}) => {
  const { integrationData, updateIntegration, addWorkflowAction, updateWorkflowAction, deleteWorkflowAction, syncData } = useIntegrationManagement(projectId);
  const [filters, setFilters] = useState<FilterOptions>({
    searchText: '',
    dateRange: { start: null, end: null },
    status: [],
    priority: [],
    systems: [],
    assignedTo: [],
    type: []
  });
  const [savedFilterName, setSavedFilterName] = useState<string>('');
  const [savedFilters, setSavedFilters] = useState<string[]>([]);
  const [showFilterModal, setShowFilterModal] = useState<boolean>(false);
  const [showDashboard, setShowDashboard] = useState<boolean>(true);
  const [showNotificationCenter, setShowNotificationCenter] = useState<boolean>(false);
  const [showWorkflowModal, setShowWorkflowModal] = useState<boolean>(false);
  const [newWorkflowAction, setNewWorkflowAction] = useState<Partial<WorkflowAction>>({
    name: '',
    description: '',
    trigger: {
      type: 'status_change',
      conditions: []
    },
    actions: []
  });
  const [sortBy, setSortBy] = useState<SortKey>('none');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10); // Number of items per page

  const unreadNotifications = useMemo(() => 
    notifications.filter(n => !n.isRead).length,
    [notifications]
  );

  useEffect(() => {
    try {
      setSavedFilters(getSavedFilterNames());
    } catch (error) {
      console.error('Error loading saved filters:', error);
    }
  }, []);

  const handleSyncRetry = useCallback(() => {
    syncData();
  }, [syncData]);

  const handleIntegrationUpdate = useCallback((updates: Partial<IntegrationData>): void => {
    try {
      updateIntegration(updates);
      if (onIntegrationUpdate) {
        onIntegrationUpdate(integrationData);
      }
    } catch (error) {
      console.error('Error updating integration:', error);
    }
  }, [updateIntegration, onIntegrationUpdate, integrationData]);

  const handleExport = useCallback(async (format: 'pdf' | 'excel' | 'csv' | 'json'): Promise<void> => {
    try {
      await exportAllReports(integrationData, format);
    } catch (error: any) {
      console.error(`Export error (${format}):`, error);
      throw error;
    }
  }, [integrationData]);

  const handleFilterChange = useCallback((key: keyof FilterOptions, value: any): void => {
    setFilters(prev => ({ ...prev, [key]: value }));
  }, [setFilters]);

  const handleQuickFilter = useCallback((filterKey: keyof typeof quickFilters): void => {
    try {
      const dateRange = quickFilters[filterKey].getDateRange();
      setFilters(prev => ({ 
        ...prev, 
        dateRange: { 
          start: dateRange.start || null, 
          end: dateRange.end || null 
        } 
      }));
    } catch (error) {
      console.error('Error applying quick filter:', error);
    }
  }, [setFilters]);

  const handleSaveFilter = useCallback((): void => {
    if (savedFilterName) {
      try {
        saveFilter(savedFilterName, filters);
        setSavedFilters(getSavedFilterNames());
        setSavedFilterName('');
        setShowFilterModal(false);
      } catch (error) {
        console.error('Error saving filter:', error);
      }
    }
  }, [savedFilterName, filters, setSavedFilters, setSavedFilterName, setShowFilterModal]);

  const handleLoadFilter = useCallback((name: string): void => {
    try {
      const loadedFilter = loadFilter(name);
      if (loadedFilter) {
        setFilters(loadedFilter);
      }
    } catch (error) {
      console.error('Error loading filter:', error);
    }
  }, [setFilters]);

  const handleDeleteFilter = useCallback((name: string): void => {
    try {
      deleteFilter(name);
      setSavedFilters(getSavedFilterNames());
    } catch (error) {
      console.error('Error deleting filter:', error);
    }
  }, [setSavedFilters]);

  const handleNotificationClick = useCallback((notification: Notification): void => {
    try {
      const item = integrationData.items.find(i => i.id === notification.itemId);
      if (item) {
        handleIntegrationUpdate({ activeTab: item.type });
      }
    } catch (error) {
      console.error('Error handling notification click:', error);
    }
  }, [integrationData.items, handleIntegrationUpdate]);

  const handleAddWorkflowAction = useCallback((): void => {
    if (newWorkflowAction.name && newWorkflowAction.description && newWorkflowAction.trigger && newWorkflowAction.actions) {
      try {
        const action = createWorkflowAction(
          newWorkflowAction.name,
          newWorkflowAction.description,
          newWorkflowAction.trigger as any,
          newWorkflowAction.actions as any
        );
        addWorkflowAction(action);
        setNewWorkflowAction({
          name: '',
          description: '',
          trigger: {
            type: 'status_change',
            conditions: []
          },
          actions: []
        });
        setShowWorkflowModal(false);
      } catch (error) {
        console.error('Error adding workflow action:', error);
      }
    }
  }, [newWorkflowAction, addWorkflowAction, setNewWorkflowAction, setShowWorkflowModal]);

  const handleToggleWorkflowAction = useCallback((actionId: string, isActive: boolean): void => {
    try {
      updateWorkflowAction(actionId, { isActive });
    } catch (error) {
      console.error('Error toggling workflow action:', error);
    }
  }, [updateWorkflowAction]);

  const handleDeleteWorkflowAction = useCallback((actionId: string): void => {
    try {
      deleteWorkflowAction(actionId);
    } catch (error) {
      console.error('Error deleting workflow action:', error);
    }
  }, [deleteWorkflowAction]);

  const handleDateChange = useCallback((field: 'start' | 'end', value: string) => {
    const date = (value && !isNaN(new Date(value).getTime())) ? new Date(value) : null;
    handleFilterChange(field === 'start' ? 'dateRange' : 'dateRange', {
      ...filters.dateRange,
      [field]: date
    });
  }, [handleFilterChange, filters.dateRange]);

  const renderSyncStatus = useCallback(() => (
    <div className="flex items-center space-x-2 text-sm">
      <div className={`w-2 h-2 rounded-full ${
        integrationData.syncState.status === 'syncing' ? 'bg-yellow-500 animate-pulse' :
        integrationData.syncState.status === 'error' ? 'bg-red-500' :
        'bg-green-500'
      }`} />
      <span className="text-gray-600">
        {integrationData.syncState.status === 'syncing' ? 'Senkronize ediliyor...' :
         integrationData.syncState.status === 'error' ? 'Senkronizasyon hatası' :
         'Senkronize edildi'}
      </span>
      {integrationData.syncState.pendingChanges.length > 0 && (
        <span className="text-gray-600">
          ({integrationData.syncState.pendingChanges.length} bekleyen değişiklik)
        </span>
      )}
    </div>
  ), [integrationData.syncState]);

  const renderLoadingOverlay = useCallback(() => (
    isLoading && (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4" />
          <p className="text-gray-700">Yükleniyor...</p>
        </div>
      </div>
    )
  ), [isLoading]);

  const renderWorkflowSection = useCallback(() => (
    <div className="workflow-section bg-white p-4 rounded-lg shadow mb-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">İş Akışı Otomasyonu</h3>
        <button
          onClick={() => setShowWorkflowModal(true)}
          className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Yeni Aksiyon Ekle
        </button>
      </div>

      <div className="space-y-4">
        {integrationData.workflowActions.map(action => (
          <div
            key={action.id}
            className="p-4 border rounded-lg"
          >
            <div className="flex justify-between items-start">
              <div>
                <h4 className="font-semibold">{action.name}</h4>
                <p className="text-sm text-gray-600">{action.description}</p>
                <div className="mt-2">
                  <span className="text-xs bg-gray-200 px-2 py-1 rounded">
                    Tetikleyici: {action.trigger.type}
                  </span>
                  {action.trigger.conditions.map((condition, index) => (
                    <span
                      key={index}
                      className="ml-2 text-xs bg-gray-200 px-2 py-1 rounded"
                    >
                      {condition.itemType} {condition.status}
                    </span>
                  ))}
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={action.isActive}
                    onChange={e => handleToggleWorkflowAction(action.id, e.target.checked)}
                    className="h-4 w-4 text-blue-600"
                  />
                  <span className="ml-2 text-sm text-gray-600">Aktif</span>
                </label>
                <button
                  onClick={() => handleDeleteWorkflowAction(action.id)}
                  className="p-1 text-red-600 hover:text-red-700"
                >
                  ×
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  ), [integrationData.workflowActions, handleToggleWorkflowAction, handleDeleteWorkflowAction, setShowWorkflowModal]);

  const renderWorkflowModal = useCallback(() => (
    showWorkflowModal && (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
        <div className="bg-white p-6 rounded-lg w-[600px]">
          <h3 className="text-lg font-semibold mb-4">Yeni İş Akışı Aksiyonu</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">İsim</label>
              <input
                type="text"
                value={newWorkflowAction.name}
                onChange={e => setNewWorkflowAction(prev => ({ ...prev, name: e.target.value }))}
                className="mt-1 w-full p-2 border rounded"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Açıklama</label>
              <textarea
                value={newWorkflowAction.description}
                onChange={e => setNewWorkflowAction(prev => ({ ...prev, description: e.target.value }))}
                className="mt-1 w-full p-2 border rounded"
                rows={3}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Tetikleyici Tipi</label>
              <select
                value={newWorkflowAction.trigger?.type}
                onChange={e => {
                  const triggerType = e.target.value as WorkflowAction['trigger']['type'];
                  setNewWorkflowAction(prev => ({
                    ...prev,
                    trigger: {
                      ...prev.trigger!,
                      type: triggerType
                    }
                  }));
                }}
                className="mt-1 w-full p-2 border rounded"
              >
                <option value="status_change">Durum Değişikliği</option>
                <option value="approval">Onay</option>
                <option value="due_date">Son Tarih</option>
                <option value="manual">Manuel</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Aksiyonlar</label>
              <div className="mt-2 space-y-2">
                <button
                  onClick={() => setNewWorkflowAction(prev => ({
                    ...prev,
                    actions: [
                      ...(prev.actions || []),
                      { type: 'notification', config: { type: 'info', message: '' } }
                    ]
                  }))}
                  className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300"
                >
                  Bildirim Ekle
                </button>
                <button
                  onClick={() => setNewWorkflowAction(prev => ({
                    ...prev,
                    actions: [
                      ...(prev.actions || []),
                      { type: 'reminder', config: { message: '' } }
                    ]
                  }))}
                  className="ml-2 px-3 py-1 bg-gray-200 rounded hover:bg-gray-300"
                >
                  Hatırlatıcı Ekle
                </button>
                <button
                  onClick={() => setNewWorkflowAction(prev => ({
                    ...prev,
                    actions: [
                      ...(prev.actions || []),
                      { type: 'calendar_event', config: { description: '', location: '', attendees: [] } }
                    ]
                  }))}
                  className="ml-2 px-3 py-1 bg-gray-200 rounded hover:bg-gray-300"
                >
                  Takvim Etkinliği Ekle
                </button>
              </div>
            </div>
          </div>

          <div className="mt-6 flex justify-end space-x-2">
            <button
              onClick={() => setShowWorkflowModal(false)}
              className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
            >
              İptal
            </button>
            <button
              onClick={handleAddWorkflowAction}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Ekle
            </button>
          </div>
        </div>
      </div>
    )
  ), [showWorkflowModal, newWorkflowAction, handleAddWorkflowAction, setNewWorkflowAction, setShowWorkflowModal]);

  const renderFilterSection = useCallback(() => (
    <div className="filter-section bg-white p-4 rounded-lg shadow mb-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">Filtreleme ve Sıralama</h3>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="px-3 py-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 flex items-center"
        >
          {showFilters ? 'Gizle' : 'Göster'}
          <span className="ml-2">
            {showFilters ? '▼' : '▶'}
          </span>
        </button>
      </div>

      {showFilters && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Text Search */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Metin Arama</label>
            <input
              type="text"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
              value={filters.searchText}
              onChange={(e) => handleFilterChange('searchText', e.target.value)}
            />
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Durum</label>
            <select
              multiple
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm h-24"
              value={filters.status}
              onChange={(e) => handleFilterChange('status', Array.from(e.target.selectedOptions, option => option.value))}
            >
              <option value="not_started">Başlamadı</option>
              <option value="in_progress">Devam Ediyor</option>
              <option value="completed">Tamamlandı</option>
              <option value="blocked">Engellendi</option>
              <option value="delayed">Gecikmeli</option>
              <option value="pending">Beklemede</option>
            </select>
          </div>

          {/* Priority Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Öncelik</label>
            <select
              multiple
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm h-24"
              value={filters.priority}
              onChange={(e) => handleFilterChange('priority', Array.from(e.target.selectedOptions, option => option.value))}
            >
              <option value="low">Düşük</option>
              <option value="medium">Orta</option>
              <option value="high">Yüksek</option>
              <option value="critical">Kritik</option>
            </select>
          </div>

          {/* Type Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Tip</label>
            <select
              multiple
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm h-24"
              value={filters.type}
              onChange={(e) => handleFilterChange('type', Array.from(e.target.selectedOptions, option => option.value))}
            >
              <option value="coordination">Koordinasyon</option>
              <option value="testing">Test</option>
              <option value="commissioning">Devreye Alma</option>
              <option value="transition">Geçiş</option>
              <option value="dependency">Bağımlılık</option>
            </select>
          </div>

          {/* Systems Filter (Example - assuming systems are strings) */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Sistemler</label>
            <input
              type="text"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
              value={filters.systems.join(', ')}
              onChange={(e) => handleFilterChange('systems', e.target.value.split(',').map(s => s.trim()))}
              placeholder="Virgülle ayırın (örn: hvac, electrical)"
            />
          </div>

          {/* AssignedTo Filter (Example - assuming assignedTo are strings) */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Atanan Kişi</label>
            <input
              type="text"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
              value={filters.assignedTo.join(', ')}
              onChange={(e) => handleFilterChange('assignedTo', e.target.value.split(',').map(s => s.trim()))}
              placeholder="Virgülle ayırın (örn: user1, user2)"
            />
          </div>

          {/* Date Range Filter - Start Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Başlangıç Tarihi (Min)</label>
            <input
              type="date"
              value={filters.dateRange.start ? filters.dateRange.start.toISOString().split('T')[0] : ''}
              onChange={e => handleDateChange('start', e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
            />
          </div>

          {/* Date Range Filter - End Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Bitiş Tarihi (Max)</label>
            <input
              type="date"
              value={filters.dateRange.end ? filters.dateRange.end.toISOString().split('T')[0] : ''}
              onChange={e => handleDateChange('end', e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
            />
          </div>
        </div>
      )}

      {/* Quick filter chips */}
      <div className="mt-4 flex flex-wrap gap-2">
        {Object.entries(quickFilters).map(([key, filter]) => (
          <button
            key={key}
            onClick={() => handleQuickFilter(key as keyof typeof quickFilters)}
            className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm hover:bg-blue-200"
          >
            {filter.label}
          </button>
        ))}
      </div>
    </div>
  ), [showFilters, filters, handleFilterChange, handleQuickFilter]);

  const renderFilterModal = useCallback(() => (
    // Modal for managing saved filters
    showFilterModal && (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
        <div className="bg-white p-6 rounded-lg w-96">
          <h3 className="text-lg font-semibold mb-4">Kayıtlı Filtreleri Yönet</h3>
          <ul className="space-y-2">
            {savedFilters.map(filterName => (
              <li key={filterName} className="flex justify-between items-center">
                <span>{filterName}</span>
                <button
                  onClick={() => handleDeleteFilter(filterName)}
                  className="p-1 text-red-600 hover:text-red-700"
                >
                  Sil
                </button>
              </li>
            ))}
          </ul>
          <button
            onClick={() => setShowFilterModal(false)}
            className="mt-4 px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
          >
            Kapat
          </button>
        </div>
      </div>
    )
  ), [showFilterModal, savedFilters, handleDeleteFilter, setShowFilterModal]);

  const renderExportSection = useCallback(() => (
    <div className="export-section bg-white p-4 rounded-lg shadow mb-4">
      <h3 className="text-lg font-semibold mb-4">Dışa Aktarma Seçenekleri</h3>
      <Suspense fallback={<div>Yükleniyor...</div>}>
        <LazyExportComponent onExport={handleExport} className="flex space-x-2" />
      </Suspense>
    </div>
  ), [handleExport]);

  const renderListItem = useCallback((item: BaseItem) => (
    <div
      key={item.id}
      className="p-4 border rounded-lg mb-4 hover:shadow-md transition-shadow"
    >
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <div className="flex items-center space-x-2">
            <h4 className="text-lg font-semibold">{item.name}</h4>
            <span className={`px-2 py-1 text-xs rounded ${
              item.status === 'completed' ? 'bg-green-100 text-green-800' :
              item.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
              item.status === 'blocked' ? 'bg-red-100 text-red-800' :
              item.status === 'delayed' ? 'bg-yellow-100 text-yellow-800' :
              'bg-gray-100 text-gray-800'
            }`}>
              {item.status}
            </span>
            <span className={`px-2 py-1 text-xs rounded ${
              item.priority === 'critical' ? 'bg-red-100 text-red-800' :
              item.priority === 'high' ? 'bg-orange-100 text-orange-800' :
              item.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
              'bg-green-100 text-green-800'
            }`}>
              {item.priority}
            </span>
          </div>
          {(item as any).description && <p className="text-sm text-gray-600 mt-1">{(item as any).description}</p>}
          {(item as any).systems && Array.isArray((item as any).systems) && (item as any).systems.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-2">
              {(item as any).systems.map((system: string) => (
                <span key={system} className="px-2 py-1 bg-gray-100 text-xs rounded">
                  {system}
                </span>
              ))}
            </div>
          )}
          <div className="mt-2 flex items-center text-sm text-gray-500">
            <span className="mr-4">
              Başlangıç: {item.startDate.toLocaleDateString()}
            </span>
            <span>
              Bitiş: {item.endDate.toLocaleDateString()}
            </span>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          {item.approvalSteps && item.approvalSteps.length > 0 && (
            <div className="flex items-center">
              <span className="text-sm text-gray-600 mr-2">Onaylar:</span>
              {item.approvalSteps.map((step) => (
                <span
                  key={step.id}
                  className={`px-2 py-1 text-xs rounded ml-1 ${
                    step.status === 'approved' ? 'bg-green-100 text-green-800' :
                    step.status === 'rejected' ? 'bg-red-100 text-red-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}
                >
                  {step.approver}
                </span>
              ))}
            </div>
          )}
          {item.assignments && item.assignments.length > 0 && (
            <div className="flex items-center">
              <span className="text-sm text-gray-600 mr-2">Atananlar:</span>
              {item.assignments.map((assignment) => (
                <span
                  key={assignment.id}
                  className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded ml-1"
                >
                  {assignment.assignee}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  ), []);

  const renderCoordinationList = useCallback(() => {
    const items = integrationData.items.filter(
      item => item.type === 'coordination'
    ) as SystemDependency[];

    return (
      <div className="space-y-4">
        {items.map(item => (
          <div key={item.id} className="p-4 border rounded-lg">
            {renderListItem(item)}
            <div className="mt-4 grid grid-cols-2 gap-4">
              <div>
                <span className="text-sm font-medium text-gray-700">Bağımlılık Tipi:</span>
                <span className="ml-2 text-sm text-gray-600">{item.dependencyType}</span>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-700">Etki:</span>
                <span className={`ml-2 px-2 py-1 text-xs rounded ${
                  item.impact === 'high' ? 'bg-red-100 text-red-800' :
                  item.impact === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-green-100 text-green-800'
                }`}>
                  {item.impact}
                </span>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-700">Kaynak Sistem:</span>
                <span className="ml-2 text-sm text-gray-600">{item.sourceSystem}</span>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-700">Hedef Sistem:</span>
                <span className="ml-2 text-sm text-gray-600">{item.targetSystem}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }, [integrationData.items, renderListItem]);

  const renderTestingList = useCallback(() => {
    const items = integrationData.items.filter(
      item => item.type === 'testing'
    ) as IntegrationTest[];

    return (
      <div className="space-y-4">
        {items.map(item => (
          <div key={item.id} className="p-4 border rounded-lg">
            {renderListItem(item)}
            <div className="mt-4">
              <span className="text-sm font-medium text-gray-700">Test Tipi:</span>
              <span className="ml-2 text-sm text-gray-600">{item.testType}</span>
              <div className="mt-2">
                <h5 className="text-sm font-medium text-gray-700">Test Senaryoları:</h5>
                <div className="mt-1 space-y-2">
                  {item.testCases.map(testCase => (
                    <div
                      key={testCase.id}
                      className="p-2 bg-gray-50 rounded"
                    >
                      <div className="flex justify-between items-center">
                        <span className="text-sm">{testCase.name}</span>
                        <span className={`px-2 py-1 text-xs rounded ${
                          testCase.status === 'passed' ? 'bg-green-100 text-green-800' :
                          testCase.status === 'failed' ? 'bg-red-100 text-red-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {testCase.status}
                        </span>
                      </div>
                      {testCase.result && (
                        <p className="mt-1 text-xs text-gray-600">{testCase.result}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }, [integrationData.items, renderListItem]);

  const renderCommissioningList = useCallback(() => {
    const items = integrationData.items.filter(
      item => item.type === 'commissioning'
    ) as CommissioningPlan[];

    return (
      <div className="space-y-4">
        {items.map(item => (
          <div key={item.id} className="p-4 border rounded-lg">
            {renderListItem(item)}
            <div className="mt-4">
              <span className="text-sm font-medium text-gray-700">Plan Tipi:</span>
              <span className="ml-2 text-sm text-gray-600">{item.planType}</span>
              <div className="mt-2">
                <h5 className="text-sm font-medium text-gray-700">Adımlar:</h5>
                <div className="mt-1 space-y-2">
                  {item.steps.map(step => (
                    <div
                      key={step.id}
                      className="p-2 bg-gray-50 rounded"
                    >
                      <div className="flex justify-between items-center">
                        <span className="text-sm">{step.name}</span>
                        <span className={`px-2 py-1 text-xs rounded ${
                          step.status === 'completed' ? 'bg-green-100 text-green-800' :
                          step.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {step.status}
                        </span>
                      </div>
                      <div className="mt-1 flex items-center text-xs text-gray-600">
                        <span className="mr-4">
                          Başlangıç: {step.startDate.toLocaleDateString()}
                        </span>
                        <span>
                          Bitiş: {step.endDate.toLocaleDateString()}
                        </span>
                      </div>
                      <div className="mt-1">
                        <span className="text-xs text-gray-600">
                          Atanan: {step.assignedTo}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }, [integrationData.items, renderListItem]);

  const renderTransitionList = useCallback(() => {
    const items = integrationData.items.filter(
      item => item.type === 'transition'
    ) as SystemTransition[];

    return (
      <div className="space-y-4">
        {items.map(item => (
          <div key={item.id} className="p-4 border rounded-lg">
            {renderListItem(item)}
            <div className="mt-4">
              <span className="text-sm font-medium text-gray-700">Geçiş Tipi:</span>
              <span className="ml-2 text-sm text-gray-600">{item.transitionType}</span>
              <div className="mt-2 grid grid-cols-2 gap-4">
                <div>
                  <span className="text-sm font-medium text-gray-700">Mevcut Sistem:</span>
                  <span className="ml-2 text-sm text-gray-600">{item.currentSystem}</span>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-700">Hedef Sistem:</span>
                  <span className="ml-2 text-gray-600">{item.targetSystem}</span>
                </div>
              </div>
              <div className="mt-2">
                <h5 className="text-sm font-medium text-gray-700">Migrasyon Adımları:</h5>
                <div className="mt-1 space-y-2">
                  {item.migrationSteps.map(step => (
                    <div
                      key={step.id}
                      className="p-2 bg-gray-50 rounded"
                    >
                      <div className="flex justify-between items-center">
                        <span className="text-sm">{step.name}</span>
                        <span className={`px-2 py-1 text-xs rounded ${
                          step.status === 'completed' ? 'bg-green-100 text-green-800' :
                          step.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {step.status}
                        </span>
                      </div>
                      <div className="mt-1 flex items-center text-xs text-gray-600">
                        <span className="mr-4">
                          Başlangıç: {step.startDate.toLocaleDateString()}
                        </span>
                        <span>
                          Bitiş: {step.endDate.toLocaleDateString()}
                        </span>
                      </div>
                      <div className="mt-1">
                        <span className="text-xs text-gray-600">
                          Atanan: {step.assignedTo}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }, [integrationData.items, renderListItem]);

  // Apply filters and sorting
  const filteredItems = useMemo(() => filterItems(integrationData.items, filters), [integrationData.items, filters]);

  const sortedItems = useMemo(() => {
    if (sortBy === 'none') return filteredItems;

    const sortMultiplier = sortOrder === 'asc' ? 1 : -1;

    return [...filteredItems].sort((a, b) => {
      const aValue = a[sortBy as keyof BaseItem];
      const bValue = b[sortBy as keyof BaseItem];

      if (aValue === null || aValue === undefined) return -1 * sortMultiplier;
      if (bValue === null || bValue === undefined) return 1 * sortMultiplier;

      if (aValue < bValue) return -1 * sortMultiplier;
      if (aValue > bValue) return 1 * sortMultiplier;
      return 0;
    });
  }, [filteredItems, sortBy, sortOrder]);

  // Calculate items for current page
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = useMemo(() => 
    sortedItems.slice(indexOfFirstItem, indexOfLastItem),
    [sortedItems, indexOfFirstItem, indexOfLastItem]
  );

  // Calculate total pages
  const totalPages = useMemo(() => 
    Math.ceil(sortedItems.length / itemsPerPage),
    [sortedItems.length, itemsPerPage]
  );

  // Change page
  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  const renderNotificationToggle = useCallback(() => (
    <button
      onClick={() => setShowNotificationCenter(!showNotificationCenter)}
      className="relative px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center"
    >
      <span>Bildirim Merkezi</span>
      {unreadNotifications > 0 && (
        <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
          {unreadNotifications}
        </span>
      )}
    </button>
  ), [showNotificationCenter, unreadNotifications]);

  return (
    <div className="integration-management p-6 bg-gray-100 min-h-screen">
      {renderLoadingOverlay()}

      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Entegrasyon Yönetimi</h2>
        <div className="flex items-center space-x-4">
          {renderSyncStatus()}
          {renderNotificationToggle()}
        </div>
      </div>

      {/* Notification Center Modal/Sidebar */}
      {showNotificationCenter && (
        <NotificationCenter
          notifications={notifications}
          onNotificationClick={handleNotificationClick}
          onNotificationAction={onNotificationAction}
          syncStatus={integrationData.syncState}
          onSyncRetry={handleSyncRetry}
          items={integrationData.items}
        />
      )}

      {/* Dashboard Toggle */}
      <div className="flex justify-end mb-4">
        <button
          onClick={() => setShowDashboard(!showDashboard)}
          className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 flex items-center"
        >
          {showDashboard ? (
            <>
              <span>Dashboard'ı Gizle</span>
              <span className="ml-2">▼</span>
            </>
          ) : (
            <>
              <span>Dashboard'ı Göster</span>
              <span className="ml-2">▶</span>
            </>
          )}
        </button>
      </div>

      {/* Dashboard Section */}
      {showDashboard && (
        <div className="mb-6">
          <Dashboard data={integrationData} />
        </div>
      )}

      {/* Workflow Section */}
      {renderWorkflowSection()}

      {/* Filter Section */}
      {renderFilterSection()}

      {/* Export Section */}
      {renderExportSection()}

      {/* Integration Items List */}
      <div className="integration-items-list bg-white p-4 rounded-lg shadow">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">
            Entegrasyon Öğeleri ({sortedItems.length})
          </h3>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">Sırala:</span>
            <select
              className="border rounded px-2 py-1"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortKey)}
            >
              <option value="none">Sıralama Yok</option>
              <option value="name">İsim</option>
              <option value="startDate">Başlangıç Tarihi</option>
              <option value="endDate">Bitiş Tarihi</option>
              <option value="status">Durum</option>
              <option value="priority">Öncelik</option>
            </select>
            <button
              onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
              className="px-2 py-1 bg-gray-200 rounded hover:bg-gray-300"
            >
              {sortOrder === 'asc' ? '↑' : '↓'}
            </button>
          </div>
        </div>

        <div className="space-y-4">
          {currentItems.length > 0 ? (
            currentItems.map(renderListItem)
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-600">Filtrelere uygun öğe bulunamadı.</p>
              <button
                onClick={() => setFilters({
                  searchText: '',
                  dateRange: { start: null, end: null },
                  status: [],
                  priority: [],
                  systems: [],
                  assignedTo: [],
                  type: []
                })}
                className="mt-2 text-blue-600 hover:text-blue-800"
              >
                Filtreleri Temizle
              </button>
            </div>
          )}
        </div>

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center mt-4 space-x-2">
            <button
              onClick={() => paginate(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-3 py-1 border rounded-md disabled:opacity-50"
            >
              Önceki
            </button>
            {[...Array(totalPages)].map((_, index) => (
              <button
                key={index + 1}
                onClick={() => paginate(index + 1)}
                className={`px-3 py-1 border rounded-md ${currentPage === index + 1 ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
              >
                {index + 1}
              </button>
            ))}
            <button
              onClick={() => paginate(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="px-3 py-1 border rounded-md disabled:opacity-50"
            >
              Sonraki
            </button>
          </div>
        )}
      </div>

      {/* Workflow Modal */}
      {renderWorkflowModal()}
    </div>
  );
};

export default IntegrationManagement;