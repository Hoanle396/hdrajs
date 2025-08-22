// HDRA.js Framework - Main Export File
// This file serves as the main entry point for the framework

// Core exports
export * from './core';

// Common exports (decorators, interfaces)
export * from './common/decorators';
export * from './common/interfaces';

// Specific feature exports to avoid conflicts
export { 
    ValidationPipe, 
    ValidationException,
    ValidateRequired,
    ValidateString,
    ValidateNumber,
    ValidateEmail,
    ValidateMinLength,
    ValidateMaxLength,
    ValidateIsIn,
    UsePipes
} from './features/validation';

export { 
    UseMiddleware, 
    getMiddleware,
    CorsMiddleware,
    LoggerMiddleware,
    RateLimitMiddleware,
    CompressionMiddleware
} from './features/middleware';

export { 
    UseInterceptors, 
    getInterceptors,
    LoggingInterceptor,
    CacheInterceptor,
    TransformInterceptor,
    TimeoutInterceptor
} from './features/interceptors';

export { 
    container, 
    Scope, 
    Inject, 
    Optional, 
    createProvider 
} from './features/dependency-injection';
