import * as Sentry from '@sentry/nextjs';
import { AppError } from '../errors/AppError';

class SentryService {
  private static instance: SentryService;
  private initialized = false;

  private constructor() {}

  static getInstance(): SentryService {
    if (!SentryService.instance) {
      SentryService.instance = new SentryService();
    }
    return SentryService.instance;
  }

  initialize() {
    if (this.initialized) return;

    if (process.env.NEXT_PUBLIC_SENTRY_DSN) {
      Sentry.init({
        dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
        environment: process.env.NODE_ENV,
        tracesSampleRate: 1.0,
        integrations: [
          Sentry.browserTracingIntegration(),
          Sentry.replayIntegration(),
        ],
      });
      this.initialized = true;
    }
  }

  captureError(error: unknown, context?: Record<string, unknown>) {
    if (!this.initialized) return;

    const appError = AppError.fromApiError(error);
    
    Sentry.withScope((scope) => {
      // Add error context
      if (context) {
        Object.entries(context).forEach(([key, value]) => {
          scope.setExtra(key, value);
        });
      }

      // Add error details
      if (appError.details) {
        scope.setExtra('errorDetails', appError.details);
      }

      // Set error level
      scope.setLevel(appError.statusCode >= 500 ? 'error' : 'warning');

      // Capture the error
      Sentry.captureException(appError);
    });
  }

  setUser(user: { id: string; email?: string; username?: string } | null) {
    if (!this.initialized) return;
    Sentry.setUser(user);
  }

  addBreadcrumb(breadcrumb: Sentry.Breadcrumb) {
    if (!this.initialized) return;
    Sentry.addBreadcrumb(breadcrumb);
  }
}

export const sentryService = SentryService.getInstance(); 