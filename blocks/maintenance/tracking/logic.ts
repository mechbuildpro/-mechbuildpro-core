import React from 'react';

interface MaintenanceHistoryItem {
  date: string;
  status: string;
  notes: string;
}

interface MaintenanceTrackingState {
  status: string;
  history: MaintenanceHistoryItem[];
}

export const useMaintenanceTracking = (maintenanceId: string) => {
  const [state, setState] = React.useState<MaintenanceTrackingState>({
    status: 'pending',
    history: []
  });

  const updateStatus = (newStatus: string) => {
    setState(prev => ({
      ...prev,
      status: newStatus,
      history: [
        ...prev.history,
        {
          date: new Date().toISOString(),
          status: newStatus,
          notes: `Status changed to ${newStatus}`
        }
      ]
    }));
  };

  return {
    status: state.status,
    history: state.history,
    updateStatus
  };
}; 