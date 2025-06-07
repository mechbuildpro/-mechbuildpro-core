'use client';

import React, { ReactNode } from 'react';
import { errorLogger } from './services/errorLogger';

interface ErrorDetailsProps {
  errorCode: string;
  onStatusChange: (code: string, status: 'open' | 'investigating' | 'resolved' | 'ignored') => void;
}

export function ErrorDetails({ errorCode, onStatusChange }: ErrorDetailsProps) {
  const error = errorLogger.getErrorByCode(errorCode);

  if (!error) {
    return (
      <div className="p-4 text-center text-gray-500">
        Hata detayları bulunamadı
      </div>
    );
  }

  const renderDetails = (details: unknown): ReactNode => {
    if (details === null || details === undefined) return null;
    
    try {
      let formattedDetails: string;
      if (typeof details === 'object') {
        formattedDetails = JSON.stringify(details, null, 2);
      } else {
        formattedDetails = String(details);
      }
      
      return (
        <div>
          <span className="text-xs text-gray-500">Detaylar:</span>
          <pre className="text-xs bg-gray-50 p-2 rounded mt-1 overflow-x-auto">
            {formattedDetails}
          </pre>
        </div>
      );
    } catch {
      return null;
    }
  };

  const detailsNode = error.details ? renderDetails(error.details) : null;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium text-gray-700">Hata Detayları</h4>
        <select
          value={error.status || 'open'}
          onChange={(e) => onStatusChange(errorCode, e.target.value as any)}
          className="px-2 py-1 text-sm border rounded"
        >
          <option value="open">Açık</option>
          <option value="investigating">İnceleniyor</option>
          <option value="resolved">Çözüldü</option>
          <option value="ignored">Yok Sayıldı</option>
        </select>
      </div>

      <div className="space-y-2">
        <div>
          <span className="text-xs text-gray-500">Hata Kodu:</span>
          <p className="text-sm">{error.code}</p>
        </div>
        
        <div>
          <span className="text-xs text-gray-500">Mesaj:</span>
          <p className="text-sm">{error.message}</p>
        </div>

        {error.url && (
          <div>
            <span className="text-xs text-gray-500">URL:</span>
            <p className="text-sm break-all">{error.url}</p>
          </div>
        )}

        {error.componentStack && (
          <div>
            <span className="text-xs text-gray-500">Bileşen Yığını:</span>
            <pre className="text-xs bg-gray-50 p-2 rounded mt-1 overflow-x-auto">
              {error.componentStack}
            </pre>
          </div>
        )}

        {detailsNode}
      </div>
    </div>
  );
} 