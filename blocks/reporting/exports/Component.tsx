import React from 'react';

interface ExportComponentProps {
  onExport: (format: 'pdf' | 'excel' | 'csv' | 'json') => void;
  className?: string;
}

export const ExportComponent: React.FC<ExportComponentProps> = ({ onExport, className }) => {
  return (
    <div className={className}>
      <button onClick={() => onExport('pdf')}>PDF</button>
      <button onClick={() => onExport('excel')}>Excel</button>
      <button onClick={() => onExport('csv')}>CSV</button>
      <button onClick={() => onExport('json')}>JSON</button>
    </div>
  );
};

export default ExportComponent;
