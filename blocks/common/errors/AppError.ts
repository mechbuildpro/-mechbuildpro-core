export class AppError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 500,
    public details?: unknown
  ) {
    super(message);
    this.name = 'AppError';
  }

  static fromApiError(error: unknown): AppError {
    if (error instanceof AppError) {
      return error;
    }

    if (error instanceof Error) {
      return new AppError(
        error.message,
        'UNKNOWN_ERROR',
        500,
        error
      );
    }

    return new AppError(
      'Beklenmeyen bir hata oluştu',
      'UNKNOWN_ERROR',
      500,
      error
    );
  }

  static validationError(message: string, details?: unknown): AppError {
    return new AppError(
      message,
      'VALIDATION_ERROR',
      400,
      details
    );
  }

  static notFoundError(message: string, details?: unknown): AppError {
    return new AppError(
      message,
      'NOT_FOUND',
      404,
      details
    );
  }

  static unauthorizedError(message: string = 'Yetkisiz erişim', details?: unknown): AppError {
    return new AppError(
      message,
      'UNAUTHORIZED',
      401,
      details
    );
  }

  static forbiddenError(message: string = 'Erişim engellendi', details?: unknown): AppError {
    return new AppError(
      message,
      'FORBIDDEN',
      403,
      details
    );
  }
} 