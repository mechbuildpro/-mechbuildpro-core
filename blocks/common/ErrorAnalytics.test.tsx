import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ErrorAnalytics } from './ErrorAnalytics';
import { errorLogger } from './services/errorLogger';

// Mock the errorLogger service
jest.mock('./services/errorLogger', () => ({
  errorLogger: {
    getRecentLogs: jest.fn()
  }
}));

// Helper to get ISO string for today
const todayISOString = new Date().toISOString();

// Helper to clear filters after render
async function clearFilters() {
  const clearButton = await screen.findByText('Filtreleri Temizle');
  fireEvent.click(clearButton);
}

describe('ErrorAnalytics', () => {
  const mockLogs = [
    {
      id: '1',
      timestamp: todayISOString,
      severity: 'error',
      component: 'auth',
      message: 'Auth error',
      responseTime: 400,
      status: 'failed',
    },
    {
      id: '2',
      timestamp: todayISOString,
      severity: 'info',
      component: 'api',
      message: 'API call',
      responseTime: 0,
      status: 'success',
    },
  ];

  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks();
    // Set up default mock implementation
    (errorLogger.getRecentLogs as jest.Mock).mockResolvedValue(mockLogs);
  });

  describe('Rendering', () => {
    it('renders without crashing', async () => {
      render(<ErrorAnalytics timeRange="1h" />);
      await clearFilters();
      await waitFor(() => {
        // Check for a Turkish heading present in the UI
        expect(screen.getByText('Hata Analizi')).toBeInTheDocument();
      });
    });

    it('renders with different time ranges', async () => {
      render(<ErrorAnalytics timeRange="24h" />);
      await clearFilters();
      await waitFor(() => {
        expect(screen.getByText('Hata Analizi')).toBeInTheDocument();
      });
    });
  });

  describe('Error Logger Integration', () => {
    it('calls errorLogger.getRecentLogs', async () => {
      render(<ErrorAnalytics timeRange="1h" />);
      await clearFilters();
      await waitFor(() => {
        expect(errorLogger.getRecentLogs).toHaveBeenCalled();
      });
    });

    it('handles empty logs', async () => {
      (errorLogger.getRecentLogs as jest.Mock).mockResolvedValue([]);
      render(<ErrorAnalytics timeRange="1h" />);
      await clearFilters();
      await waitFor(() => {
        expect(screen.getByText('Toplam Hata')).toBeInTheDocument();
        // There may be multiple zeros, so check that at least one is present
        expect(screen.getAllByText('0').length).toBeGreaterThan(0);
      });
    });
  });

  describe('Metrics Calculation', () => {
    it('calculates total errors correctly', async () => {
      render(<ErrorAnalytics timeRange="1h" />);
      await clearFilters();
      await waitFor(() => {
        expect(screen.getByText('2')).toBeInTheDocument(); // Total errors
      });
    });

    it('displays error rate', async () => {
      render(<ErrorAnalytics timeRange="1h" />);
      await clearFilters();
      await waitFor(() => {
        // The UI renders error rate as '%50.00'
        expect(screen.getByText('%50.00')).toBeInTheDocument();
      });
    });

    it('shows average response time', async () => {
      render(<ErrorAnalytics timeRange="1h" />);
      await clearFilters();
      expect(await screen.findByText('400ms')).toBeInTheDocument();
    });
  });

  describe('System Health', () => {
    it('displays CPU usage', async () => {
      render(<ErrorAnalytics timeRange="1h" />);
      await clearFilters();
      await waitFor(() => {
        expect(screen.getByText('CPU Kullanımı')).toBeInTheDocument();
      });
    });

    it('displays memory usage', async () => {
      render(<ErrorAnalytics timeRange="1h" />);
      await clearFilters();
      await waitFor(() => {
        expect(screen.getByText('Bellek Kullanımı')).toBeInTheDocument();
      });
    });

    it('displays network latency', async () => {
      render(<ErrorAnalytics timeRange="1h" />);
      await clearFilters();
      await waitFor(() => {
        expect(screen.getByText('Ağ Gecikmesi')).toBeInTheDocument();
      });
    });
  });

  describe('Error Distribution', () => {
    it('shows error severity distribution', async () => {
      render(<ErrorAnalytics timeRange="1h" />);
      await clearFilters();
      await waitFor(() => {
        expect(screen.getByText('Hata')).toBeInTheDocument();
        expect(screen.getByText('Uyarı')).toBeInTheDocument();
        expect(screen.getByText('Bilgi')).toBeInTheDocument();
      });
    });

    it('displays component-wise error distribution', async () => {
      render(<ErrorAnalytics timeRange="1h" />);
      await clearFilters();
      await waitFor(() => {
        expect(screen.getByText('auth')).toBeInTheDocument();
        expect(screen.getByText('api')).toBeInTheDocument();
      });
    });
  });

  describe('Edge Cases and Different Scenarios', () => {
    it('handles logs with different severities', async () => {
      const logsWithDifferentSeverities = [
        { id: '1', timestamp: todayISOString, severity: 'error', component: 'auth', message: 'Authentication failed', responseTime: 500, status: 'failed' },
        { id: '2', timestamp: todayISOString, severity: 'warning', component: 'api', message: 'API rate limit exceeded', responseTime: 300, status: 'failed' },
        { id: '3', timestamp: todayISOString, severity: 'info', component: 'auth', message: 'User logged in', responseTime: 200, status: 'success' }
      ];
      (errorLogger.getRecentLogs as jest.Mock).mockResolvedValue(logsWithDifferentSeverities);
      render(<ErrorAnalytics timeRange="1h" />);
      await clearFilters();
      await waitFor(() => {
        expect(screen.getByText('Hata')).toBeInTheDocument();
        expect(screen.getByText('Uyarı')).toBeInTheDocument();
        expect(screen.getByText('Bilgi')).toBeInTheDocument();
      });
    });

    it('handles logs from different components', async () => {
      const logsFromDifferentComponents = [
        { id: '1', timestamp: todayISOString, severity: 'error', component: 'auth', message: 'Authentication failed', responseTime: 500, status: 'failed' },
        { id: '2', timestamp: todayISOString, severity: 'warning', component: 'api', message: 'API rate limit exceeded', responseTime: 300, status: 'failed' },
        { id: '3', timestamp: todayISOString, severity: 'error', component: 'database', message: 'Database connection failed', responseTime: 400, status: 'failed' }
      ];
      (errorLogger.getRecentLogs as jest.Mock).mockResolvedValue(logsFromDifferentComponents);
      render(<ErrorAnalytics timeRange="1h" />);
      await clearFilters();
      await waitFor(() => {
        expect(screen.getByText('auth')).toBeInTheDocument();
        expect(screen.getByText('api')).toBeInTheDocument();
        expect(screen.getByText('database')).toBeInTheDocument();
      });
    });

    it('calculates average response time correctly', async () => {
      const logsWithVaryingResponseTimes = [
        { id: '1', timestamp: todayISOString, severity: 'error', component: 'auth', message: 'Authentication failed', responseTime: 500, status: 'failed' },
        { id: '2', timestamp: todayISOString, severity: 'warning', component: 'api', message: 'API rate limit exceeded', responseTime: 300, status: 'failed' },
        { id: '3', timestamp: todayISOString, severity: 'info', component: 'auth', message: 'User logged in', responseTime: 200, status: 'success' }
      ];
      (errorLogger.getRecentLogs as jest.Mock).mockResolvedValue(logsWithVaryingResponseTimes);
      render(<ErrorAnalytics timeRange="1h" />);
      await clearFilters();
      expect(await screen.findByText('333ms')).toBeInTheDocument();
    });
  });
}); 