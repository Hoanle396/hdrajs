// Core exports
export * from './core';
export * from './decorators';

// Enhanced feature exports - now as default v1 experience
export { 
    container, 
    Scope, 
    Injectable,
    Inject,
    Optional,
    createProvider 
} from './di/container';

export type { Provider } from './di/container';

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
} from './validation';

export type { ValidationRule } from './validation';

export {
    UseMiddleware,
    getMiddleware,
    CorsMiddleware,
    LoggerMiddleware,
    RateLimitMiddleware,
    CompressionMiddleware
} from './middleware';

export {
    UseInterceptors,
    getInterceptors,
    LoggingInterceptor,
    CacheInterceptor,
    TransformInterceptor,
    TimeoutInterceptor
} from './interceptors';

