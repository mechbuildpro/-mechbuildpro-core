'use client';

import React from 'react';
import { errorLogger } from './services/errorLogger';
import { AppError } from './errors/AppError';

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
  componentName?: string;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  async componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    const appError = AppError.fromApiError(error);
    const details = appError.details || {};
    appError.details = {
      ...details,
      componentStack: errorInfo.componentStack,
      componentName: this.props.componentName
    };

    // Log the error
    await errorLogger.log(appError);

    // Call the onError prop if provided
    this.props.onError?.(error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <h2 className="text-lg font-semibold text-red-800 mb-2">Bir Hata Oluştu</h2>
          <p className="text-red-600 mb-4">
            {this.state.error?.message || 'Beklenmeyen bir hata oluştu.'}
          </p>
          <div className="space-y-2">
            <button
              onClick={() => this.setState({ hasError: false, error: null })}
              className="px-4 py-2 bg-red-100 text-red-800 rounded hover:bg-red-200 transition-colors"
            >
              Tekrar Dene
            </button>
            <button
              onClick={() => window.location.reload()}
              className="ml-2 px-4 py-2 bg-gray-100 text-gray-800 rounded hover:bg-gray-200 transition-colors"
            >
              Sayfayı Yenile
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
} 