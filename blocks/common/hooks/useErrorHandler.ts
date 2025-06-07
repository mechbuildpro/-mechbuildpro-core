import { useState, useCallback } from 'react';
import { errorLogger } from '../services/errorLogger';
import { AppError } from '../errors/AppError';

interface ErrorState {
  message: string;
  code?: string;
  details?: unknown;
}

export function useErrorHandler(componentName?: string) {
  const [error, setError] = useState<ErrorState | null>(null);

  const handleError = useCallback(async (error: unknown) => {
    const appError = AppError.fromApiError(error);
    
    // Add component context if provided
    if (componentName) {
      const details = appError.details || {};
      appError.details = {
        ...details,
        componentName
      };
    }

    // Log the error
    await errorLogger.log(appError);

    // Update local state
    setError({
      message: appError.message,
      code: appError.code,
      details: appError.details
    });
  }, [componentName]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    error,
    handleError,
    clearError,
    hasError: error !== null
  };
} 