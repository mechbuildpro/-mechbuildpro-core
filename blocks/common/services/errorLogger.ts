import { AppError } from '../errors/AppError';
import { sentryService } from './sentryService';
import { notificationService } from './notificationService';

export type ErrorStatus = 'active' | 'resolved' | 'ignored' | 'success';

export interface ErrorLog {
  id: string;
  code: string;
  message: string;
  severity: 'error' | 'warning' | 'info';
  status: 'active' | 'resolved' | 'ignored' | 'success';
  timestamp: string;
  component?: string;
  details?: string;
  stack?: string;
  componentStack?: string;
  relatedErrors?: string[];
  responseTime?: number;
  userId?: string;
  sessionId?: string;
  url?: string;
  userAgent?: string;
  statusCode?: number;
  notes?: string;
  bounce?: boolean;
  bounced?: boolean;
  resolvedAt?: string;
  supportTicket?: boolean;
  supportTicketCreated?: boolean;
  converted?: boolean;
  revenueImpact?: number;
  recoveryTime?: number;
  systemLoad?: number;
  resourceUsage?: number;
  satisfactionScore?: number;
  cpuUsage?: number;
  memoryUsage?: number;
  networkLatency?: number;
}

interface SentryUser {
  id: string;
  email?: string;
  username?: string;
  sessionId?: string;
}

export class ErrorLogger {
  private static instance: ErrorLogger;
  private logs: ErrorLog[] = [];
  private readonly maxLogs = 100;
  private errorStatuses: Record<string, 'active' | 'resolved' | 'ignored' | 'success'> = {};
  private errorNotes: Map<string, string> = new Map();

  private constructor() {
    // Initialize Sentry
    sentryService.initialize();
  }

  static getInstance(): ErrorLogger {
    if (!ErrorLogger.instance) {
      ErrorLogger.instance = new ErrorLogger();
    }
    return ErrorLogger.instance;
  }

  private formatError(error: unknown, context?: Record<string, unknown>): ErrorLog {
    const appError = AppError.fromApiError(error);
    const log: ErrorLog = {
      id: appError.code,
      code: appError.code,
      message: appError.message,
      timestamp: new Date().toISOString(),
      severity: (appError as any)?.severity || 'medium',
      status: this.errorStatuses[appError.code] || 'active',
      statusCode: appError.statusCode || 0,
      stack: appError.stack,
      componentStack: context?.componentStack as string | undefined,
      details: appError.details as string | undefined,
      relatedErrors: context?.relatedErrors as string[] | undefined,
      url: context?.url as string | undefined,
      userAgent: context?.userAgent as string | undefined,
      userId: context?.userId as string | undefined,
      sessionId: context?.sessionId as string | undefined,
      notes: context?.notes as string | undefined,
      responseTime: context?.responseTime as number | undefined,
      bounced: context?.bounced as boolean | undefined,
      converted: context?.converted as boolean | undefined,
      revenueImpact: context?.revenueImpact as number | undefined,
      satisfactionScore: context?.satisfactionScore as number | undefined,
      supportTicketCreated: context?.supportTicketCreated as boolean | undefined,
      recoveryTime: context?.recoveryTime as number | undefined,
      systemLoad: context?.systemLoad as number | undefined,
      resourceUsage: context?.resourceUsage as number | undefined,
      component: context?.component as string | undefined,
      cpuUsage: context?.cpuUsage as number | undefined,
      memoryUsage: context?.memoryUsage as number | undefined,
      networkLatency: context?.networkLatency as number | undefined,
    };

    return log;
  }

  async log(error: unknown, context?: Record<string, unknown>): Promise<void> {
    const log = this.formatError(error, context);
    
    // Store in memory
    this.logs.unshift(log);
    if (this.logs.length > this.maxLogs) {
      this.logs.pop();
    }

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Error logged:', log);
    }

    // Send to Sentry in production
    if (process.env.NODE_ENV === 'production') {
      try {
        // Add additional context for Sentry
        const sentryContext = {
          ...context,
          errorCode: log.code,
          errorUrl: log.url,
          userAgent: log.userAgent,
          componentStack: log.componentStack,
          errorStatus: log.status,
        };

        sentryService.captureError(error, sentryContext);

        // Set user context if available
        if (log.userId) {
          const user: SentryUser = {
            id: log.userId,
            sessionId: log.sessionId,
          };
          sentryService.setUser(user);
        }

        // Add breadcrumb for error
        sentryService.addBreadcrumb({
          category: 'error',
          message: log.message,
          level: 'error',
          data: {
            code: log.code,
            statusCode: log.statusCode,
            url: log.url,
            status: log.status,
          },
        });
      } catch (e) {
        console.error('Failed to send error to Sentry:', e);
      }
    }

    // After logging the error, trigger notification for critical errors
    if ((log.statusCode && log.statusCode >= 500) || (log.severity === 'error')) {
      notificationService.notify(
        'error',
        `Kritik hata: ${log.message || log.code || 'Bilinmeyen hata'}`,
        'criticalErrors'
      );
    }
  }

  getRecentLogs(): ErrorLog[] {
    return [...this.logs];
  }

  clearLogs(): void {
    this.logs = [];
  }

  getErrorStats(): {
    total: number;
    byStatusCode: Record<number, number>;
    byCode: Record<string, number>;
    byStatus: Record<ErrorStatus, number>;
  } {
    const stats = {
      total: this.logs.length,
      byStatusCode: {} as Record<number, number>,
      byCode: {} as Record<string, number>,
      byStatus: {
        active: 0,
        resolved: 0,
        ignored: 0,
        success: 0,
      },
    };

    this.logs.forEach(log => {
      // Count by status code
      if (log.statusCode !== undefined) {
        stats.byStatusCode[log.statusCode] = (stats.byStatusCode[log.statusCode] || 0) + 1;
      }
      // Count by error code
      stats.byCode[log.code] = (stats.byCode[log.code] || 0) + 1;
      // Count by status
      if (log.status) {
        stats.byStatus[log.status]++;
      }
    });

    return stats;
  }

  updateErrorStatus(code: string, status: ErrorStatus): void {
    this.errorStatuses[code] = status;
    // Update status in existing logs
    this.logs = this.logs.map(log => 
      log.code === code ? { ...log, status } : log
    );
  }

  updateErrorNotes(code: string, notes: string): void {
    this.errorNotes.set(code, notes);
    // Update notes in existing logs
    this.logs = this.logs.map(log => 
      log.code === code ? { ...log, notes } : log
    );
  }

  getErrorStatus(code: string): 'active' | 'resolved' | 'ignored' | 'success' {
    return this.errorStatuses[code] || 'active';
  }

  getErrorNotes(code: string): string | undefined {
    return this.errorNotes.get(code);
  }

  getErrorByCode(code: string) {
    return this.logs.find(log => log.code === code);
  }
}

export const errorLogger = ErrorLogger.getInstance(); 