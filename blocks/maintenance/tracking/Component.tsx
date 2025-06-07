import React from 'react';
import { useMaintenanceTracking } from './logic';

interface MaintenanceTrackingProps {
  maintenanceId: string;
  onStatusChange?: (status: string) => void;
}

export const MaintenanceTracking: React.FC<MaintenanceTrackingProps> = ({
  maintenanceId,
  onStatusChange
}) => {
  const { status, history, updateStatus } = useMaintenanceTracking(maintenanceId);

  const handleStatusChange = (newStatus: string) => {
    updateStatus(newStatus);
    onStatusChange?.(newStatus);
  };

  return (
    <div className="maintenance-tracking">
      <div className="status-section">
        <h3>Current Status</h3>
        <select value={status} onChange={(e) => handleStatusChange(e.target.value)}>
          <option value="pending">Pending</option>
          <option value="in-progress">In Progress</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>
      
      <div className="history-section">
        <h3>Maintenance History</h3>
        <ul>
          {history.map((item, index) => (
            <li key={index}>
              <span>{item.date}</span>
              <span>{item.status}</span>
              <span>{item.notes}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default MaintenanceTracking; 