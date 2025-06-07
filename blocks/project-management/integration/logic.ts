import { useState, useEffect } from 'react';
import { WorkflowAction, ApprovalStep, TaskAssignment, triggerStatusChangeActions, defaultWorkflowActions } from './workflow';
import { Notification, createNotification } from './notifications';

export interface BaseItem {
  id: string;
  name: string;
  type: 'coordination' | 'testing' | 'commissioning' | 'transition' | 'dependency';
  startDate: Date;
  endDate: Date;
  status: string;
  priority: string;
  description?: string;
  systems?: string[];
  approvalSteps?: Array<{
    id: string;
    approver: string;
    status: 'pending' | 'approved' | 'rejected';
  }>;
  assignments?: Array<{
    id: string;
    assignee: string;
  }>;
}

export interface SystemDependency extends BaseItem {
  type: 'coordination';
  dependencyType: 'data' | 'control' | 'power' | 'communication';
  impact: 'low' | 'medium' | 'high';
  sourceSystem: string;
  targetSystem: string;
}

export interface IntegrationTest extends BaseItem {
  type: 'testing';
  testType: 'unit' | 'integration' | 'system' | 'acceptance';
  testCases: {
    id: string;
    name: string;
    description: string;
    status: 'pending' | 'passed' | 'failed';
    result?: string;
  }[];
}

export interface CommissioningPlan extends BaseItem {
  type: 'commissioning';
  planType: 'mechanical' | 'electrical' | 'control' | 'system';
  steps: {
    id: string;
    name: string;
    description: string;
    status: 'not_started' | 'in_progress' | 'completed';
    assignedTo: string;
    startDate: Date;
    endDate: Date;
  }[];
}

export interface SystemTransition extends BaseItem {
  type: 'transition';
  transitionType: 'upgrade' | 'migration' | 'replacement';
  currentSystem: string;
  targetSystem: string;
  migrationSteps: {
    id: string;
    name: string;
    description: string;
    status: 'not_started' | 'in_progress' | 'completed';
    assignedTo: string;
    startDate: Date;
    endDate: Date;
  }[];
}

export interface WorkflowHistory {
  id: string;
  itemId: string;
  fromStatus: string;
  toStatus: string;
  timestamp: Date;
  userId: string;
  comments?: string;
}

export interface SyncState {
  status: 'idle' | 'syncing' | 'error';
  lastSync: Date;
  pendingChanges: {
    id: string;
    type: 'create' | 'update' | 'delete';
    data: any;
    timestamp: Date;
    version: number;
    conflict?: boolean;
  }[];
  error?: string;
  offlineMode: boolean;
  retryCount: number;
}

export interface IntegrationData {
  items: BaseItem[];
  activeTab: 'coordination' | 'testing' | 'commissioning' | 'transition' | 'dependency';
  workflowActions: WorkflowAction[];
  workflowHistory: WorkflowHistory[];
  syncState: SyncState;
}

const dataCache: { [projectId: string]: IntegrationData } = {};

// Sync interval in milliseconds (5 minutes)
const SYNC_INTERVAL = 5 * 60 * 1000;
const MAX_RETRY_COUNT = 3;
const RETRY_DELAY = 5000; // 5 seconds

// Assume a simple auth context or user role check is available
// TODO: Replace this placeholder with a real authentication and authorization system.
// In a real application, this would involve fetching user roles/permissions and checking them against required actions.
const isAdmin = (userId: string): boolean => {
  // This is a placeholder. Replace with actual auth check.
  return userId === 'admin'; // Simple check for a user with ID 'admin'
};

const validateIntegrationItem = (item: any): boolean => {
  if (!item || typeof item !== 'object') return false;
  if (typeof item.id !== 'string' || item.id.length === 0) return false;
  if (typeof item.name !== 'string' || item.name.length === 0) return false;
  // Add more validation rules based on your BaseItem structure
  // Example: check status, priority, dates, etc.
  const validStatuses = ['not_started', 'in_progress', 'completed', 'blocked', 'delayed', 'pending'];
  if (typeof item.status !== 'string' || !validStatuses.includes(item.status)) return false;
  
  const validPriorities = ['low', 'medium', 'high', 'critical'];
  if (typeof item.priority !== 'string' || !validPriorities.includes(item.priority)) return false;

  if (!Array.isArray(item.systems) || item.systems.some((s: any) => typeof s !== 'string')) return false;
  if (!(item.startDate instanceof Date) || isNaN(item.startDate.getTime())) return false;
  if (!(item.endDate instanceof Date) || isNaN(item.endDate.getTime())) return false;

  return true;
};

export const useIntegrationManagement = (projectId: string) => {
  // TODO: Get actual logged-in user ID from context or auth state
  const currentUserId = 'admin'; // Placeholder user ID

  const [integrationData, setIntegrationData] = useState<IntegrationData>(() => {
    // Initialize from cache if available
    return dataCache[projectId] || {
      items: [],
      activeTab: 'coordination',
      workflowActions: [],
      workflowHistory: [],
      syncState: {
        status: 'idle',
        lastSync: new Date(),
        pendingChanges: [],
        offlineMode: false,
        retryCount: 0
      }
    };
  });

  const resolveConflict = async (localChange: SyncState['pendingChanges'][0], serverData: any) => {
    // Implement conflict resolution strategy
    // For now, we'll use "last write wins" strategy
    const localTimestamp = new Date(localChange.timestamp).getTime();
    const serverTimestamp = new Date(serverData.timestamp).getTime();

    if (localTimestamp > serverTimestamp) {
      return localChange.data;
    } else {
      return serverData;
    }
  };

  const syncData = async () => {
    if (integrationData.syncState.status === 'syncing' || 
        integrationData.syncState.offlineMode) return;

    try {
      setIntegrationData(prev => ({
        ...prev,
        syncState: { ...prev.syncState, status: 'syncing' }
      }));

      // Sync pending changes
      const pendingChanges = integrationData.syncState.pendingChanges;
      if (pendingChanges.length > 0) {
        await Promise.all(
          pendingChanges.map(async change => {
            try {
              // Check for conflicts
              const serverResponse = await fetch(`/api/projects/${projectId}/integration/check-conflict/${change.id}`);
              const serverData = await serverResponse.json();

              if (serverData.version !== change.version) {
                // Conflict detected
                const resolvedData = await resolveConflict(change, serverData);
                
                await fetch(`/api/projects/${projectId}/integration/sync`, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    ...change,
                    data: resolvedData,
                    version: serverData.version + 1
                  })
                });
              } else {
                // No conflict, proceed with sync
                await fetch(`/api/projects/${projectId}/integration/sync`, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify(change)
                });
              }
            } catch (error) {
              console.error(`Failed to sync change ${change.id}:`, error);
              throw error;
            }
          })
        );
      }

      // Fetch latest data
      const response = await fetch(`/api/projects/${projectId}/integration`);
      const data = await response.json();

      // Format and validate data
      const formattedData = {
        ...data,
        items: data.items.map((item: unknown) => {
          const baseItem = item as Partial<BaseItem & { startDate: string; endDate: string }>;
          return {
            ...baseItem,
            startDate: baseItem.startDate ? new Date(baseItem.startDate) : new Date(),
            endDate: baseItem.endDate ? new Date(baseItem.endDate) : new Date(),
            approvalSteps: Array.isArray(baseItem.approvalSteps) ? baseItem.approvalSteps : [],
            assignments: Array.isArray(baseItem.assignments) ? baseItem.assignments : []
          };
        })
      };

      setIntegrationData(prev => ({
        ...formattedData,
        syncState: {
          status: 'idle',
          lastSync: new Date(),
          pendingChanges: [],
          offlineMode: false,
          retryCount: 0
        }
      }));

    } catch (error) {
      console.error('Sync error:', error);
      
      const retryCount = integrationData.syncState.retryCount + 1;
      const shouldRetry = retryCount < MAX_RETRY_COUNT;

      setIntegrationData(prev => ({
        ...prev,
        syncState: {
          ...prev.syncState,
          status: shouldRetry ? 'syncing' : 'error',
          error: error instanceof Error ? error.message : 'Sync failed',
          retryCount
        }
      }));

      if (shouldRetry) {
        // Retry after delay
        setTimeout(syncData, RETRY_DELAY);
      } else {
        // Create error notification
        createNotification({
          type: 'error',
          priority: 'high',
          message: 'Senkronizasyon Hatası',
          description: 'Veri senkronizasyonu sırasında bir hata oluştu. Lütfen daha sonra tekrar deneyin.',
          itemId: 'sync-error',
          itemType: 'coordination'
        });
      }
    }
  };

  const queueChange = (change: Omit<SyncState['pendingChanges'][0], 'version'>) => {
    // Basic validation for queued changes data
    if (change.type !== 'delete' && !validateIntegrationItem(change.data)) {
      console.error('Validation failed for queued change:', change);
      // Optionally create a notification or handle the invalid change
      createNotification({
        type: 'error',
        priority: 'high',
        message: 'Geçersiz Veri Değişikliği',
        description: 'Senkronize edilmek istenen veri geçerli değil.',
        itemId: change.id || 'unknown',
        itemType: 'sync',
        metadata: { source: 'queueChange validation' }
      });
      return; // Prevent queuing invalid change
    }

    const versionedChange = {
      ...change,
      version: Date.now() // Use timestamp as version
    };

    setIntegrationData(prev => ({
      ...prev,
      syncState: {
        ...prev.syncState,
        pendingChanges: [...prev.syncState.pendingChanges, versionedChange]
      }
    }));

    // Store in local storage for offline support
    try {
      const offlineChanges = JSON.parse(localStorage.getItem('offlineChanges') || '[]');
      localStorage.setItem('offlineChanges', JSON.stringify([...offlineChanges, versionedChange]));
    } catch (error) {
      console.error('Failed to store offline changes:', error);
    }

    // Trigger sync if online
    if (!integrationData.syncState.offlineMode) {
      syncData();
    }
  };

  const loadProjectData = async () => {
    try {
      const response = await fetch(`/api/projects/${projectId}/integration`);
      if (!response.ok) throw new Error('Failed to load project data');
      
      const data = await response.json();
      const formattedData = {
        ...data,
        items: data.items.map((item: unknown) => {
          const baseItem = item as Partial<BaseItem & { startDate: string; endDate: string }>;
          const formattedItem = {
            ...baseItem,
            startDate: baseItem.startDate ? new Date(baseItem.startDate) : new Date(),
            endDate: baseItem.endDate ? new Date(baseItem.endDate) : new Date(),
            approvalSteps: Array.isArray(baseItem.approvalSteps) ? baseItem.approvalSteps : [],
            assignments: Array.isArray(baseItem.assignments) ? baseItem.assignments : []
          };
          // Validate the formatted item
          if (!validateIntegrationItem(formattedItem)) {
            console.error('Validation failed for loaded item:', formattedItem);
            // Optionally create a notification for invalid loaded data
            createNotification({
              type: 'warning',
              priority: 'medium',
              message: 'Geçersiz Öğe Verisi',
              description: `Yüklenen veride geçersiz bir öğe bulundu (ID: ${formattedItem.id || 'unknown'}).`,
              itemId: formattedItem.id || 'unknown',
              itemType: formattedItem.type || 'unknown',
              metadata: { source: 'loadProjectData validation' }
            });
          }
          return formattedItem;
        })
      };
      
      setIntegrationData(prev => ({
        ...formattedData,
        syncState: {
          status: 'idle',
          lastSync: new Date(),
          pendingChanges: [],
          offlineMode: false,
          retryCount: 0
        }
      }));
    } catch (error) {
      console.error('Error loading project data:', error);
      createNotification({
        type: 'error',
        priority: 'high',
        message: 'Proje verileri yüklenirken hata oluştu',
        description: error instanceof Error ? error.message : 'Bilinmeyen hata'
      });
    }
  };

  useEffect(() => {
    // Load data if not in cache
    if (!dataCache[projectId]) {
      loadProjectData();
    }

    const syncInterval = setInterval(syncData, SYNC_INTERVAL);
    
    // Check online status
    const handleOnline = () => {
      setIntegrationData(prev => ({
        ...prev,
        syncState: {
          ...prev.syncState,
          offlineMode: false
        }
      }));
      syncData(); // Sync when coming back online
    };

    const handleOffline = () => {
      setIntegrationData(prev => ({
        ...prev,
        syncState: {
          ...prev.syncState,
          offlineMode: true
        }
      }));
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline); // Fixed: Added handleOffline

    return () => {
      clearInterval(syncInterval);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline); // Fixed: Added handleOffline
    };
  }, [projectId]);

  // Update cache when integrationData changes
  useEffect(() => {
    dataCache[projectId] = integrationData;
  }, [projectId, integrationData]);

  const updateIntegration = (updates: Partial<IntegrationData>) => {
    if (!isAdmin(currentUserId)) {
      console.warn(`User ${currentUserId} attempted to update integration data without permission.`);
      createNotification({
        type: 'warning',
        priority: 'medium',
        message: 'Yetkilendirme Hatası',
        description: 'Entegrasyon verilerini güncelleme izniniz yok.',
        itemId: 'auth-error',
        itemType: 'system'
      });
      return; // Prevent unauthorized update
    }
    setIntegrationData(prev => {
      const updated = { ...prev, ...updates };
      
      // Track workflow history and trigger actions on status changes
      if (updates.items) {
        updates.items.forEach(item => {
          const oldItem = prev.items.find(i => i.id === item.id);
          if (oldItem && oldItem.status !== item.status) {
            // Add to workflow history
            const historyEntry: WorkflowHistory = {
              id: Math.random().toString(36).substr(2, 9),
              itemId: item.id,
              fromStatus: oldItem.status,
              toStatus: item.status,
              timestamp: new Date(),
              userId: currentUserId, // Use actual user ID
              comments: `Status changed from ${oldItem.status} to ${item.status}`
            };
            
            updated.workflowHistory = [...(updated.workflowHistory || []), historyEntry];
            
            // Queue change for sync
            queueChange({
              id: item.id,
              type: 'update',
              data: item,
              timestamp: new Date()
            });
            
            // Trigger workflow actions
            triggerStatusChangeActions(item, oldItem.status, item.status);
          }
        });
      }

      return updated;
    });
  };

  const addWorkflowAction = (action: WorkflowAction) => {
    if (!isAdmin(currentUserId)) {
      console.warn(`User ${currentUserId} attempted to add workflow action without permission.`);
      createNotification({
        type: 'warning',
        priority: 'medium',
        message: 'Yetkilendirme Hatası',
        description: 'İş akışı aksiyonu ekleme izniniz yok.',
        itemId: 'auth-error',
        itemType: 'workflow'
      });
      return; // Prevent unauthorized add
    }
    setIntegrationData(prev => ({
      ...prev,
      workflowActions: [...prev.workflowActions, action]
    }));
  };

  const updateWorkflowAction = (actionId: string, updates: Partial<WorkflowAction>) => {
    if (!isAdmin(currentUserId)) {
      console.warn(`User ${currentUserId} attempted to update workflow action ${actionId} without permission.`);
       createNotification({
        type: 'warning',
        priority: 'medium',
        message: 'Yetkilendirme Hatası',
        description: 'İş akışı aksiyonunu güncelleme izniniz yok.',
        itemId: actionId,
        itemType: 'workflow'
      });
      return; // Prevent unauthorized update
    }
    setIntegrationData(prev => ({
      ...prev,
      workflowActions: prev.workflowActions.map(action =>
        action.id === actionId ? { ...action, ...updates } : action
      )
    }));
  };

  const deleteWorkflowAction = (actionId: string) => {
    if (!isAdmin(currentUserId)) {
      console.warn(`User ${currentUserId} attempted to delete workflow action ${actionId} without permission.`);
       createNotification({
        type: 'warning',
        priority: 'medium',
        message: 'Yetkilendirme Hatası',
        description: 'İş akışı aksiyonunu silme izniniz yok.',
        itemId: actionId,
        itemType: 'workflow'
      });
      return; // Prevent unauthorized delete
    }
    setIntegrationData(prev => ({
      ...prev,
      workflowActions: prev.workflowActions.filter(action => action.id !== actionId)
    }));
  };

  const triggerStatusChangeActions = (item: BaseItem, oldStatus: string, newStatus: string) => {
    integrationData.workflowActions
      .filter(action => action.isActive && action.trigger.type === 'status_change')
      .forEach(action => {
        const condition = action.trigger.conditions.find(
          c => c.itemType === item.type && c.status === newStatus
        );
        if (condition) {
          action.actions.forEach(actionType => {
            switch (actionType.type) {
              case 'notification':
                // Ensure config and its properties exist before accessing
                const notificationConfig = (actionType.config as any);
                createNotification({
                  type: notificationConfig.type || 'info',
                  priority: notificationConfig.priority || 'medium', // Added priority
                  message: notificationConfig.message || '',
                  description: notificationConfig.description,
                  itemId: item.id,
                  itemType: item.type,
                  groupId: notificationConfig.groupId || item.id // Added groupId, defaulting to item.id
                });
                break;
              case 'reminder':
                // Handle reminder action
                break;
              case 'calendar_event':
                // Handle calendar event action
                break;
            }
          });
        }
      });
  };

  const getWorkflowHistory = (itemId: string): WorkflowHistory[] => {
    // Add read access control here if needed
    return integrationData.workflowHistory.filter(history => history.itemId === itemId);
  };

  const addWorkflowComment = (itemId: string, comment: string) => {
    if (!isAdmin(currentUserId)) {
       console.warn(`User ${currentUserId} attempted to add comment to item ${itemId} without permission.`);
        createNotification({
        type: 'warning',
        priority: 'medium',
        message: 'Yetkilendirme Hatası',
        description: 'Yorum ekleme izniniz yok.',
        itemId: itemId,
        itemType: 'comment'
      });
      return; // Prevent unauthorized comment
    }
    const item = integrationData.items.find(i => i.id === itemId);
    if (item) {
      const historyEntry: WorkflowHistory = {
        id: Math.random().toString(36).substr(2, 9),
        itemId,
        fromStatus: item.status,
        toStatus: item.status,
        timestamp: new Date(),
        userId: currentUserId, // Use actual user ID
        comments: comment
      };
      
      setIntegrationData(prev => ({
        ...prev,
        workflowHistory: [...prev.workflowHistory, historyEntry]
      }));
    }
  };

  return {
    integrationData,
    updateIntegration,
    addWorkflowAction,
    updateWorkflowAction,
    deleteWorkflowAction,
    getWorkflowHistory,
    addWorkflowComment,
    syncData,
    queueChange
  };
};