import 'reflect-metadata';

export interface ExecutionContext {
    getClass(): Function;
    getHandler(): Function;
    getArgs(): any[];
    switchToHttp(): {
        getRequest(): any;
        getResponse(): any;
        getNext(): any;
    };
}

export interface CallHandler<T = any> {
    handle(): Promise<T>;
}

export interface Interceptor<T = any, R = any> {
    intercept(context: ExecutionContext, next: CallHandler<T>): Promise<R> | R;
}

const INTERCEPTORS_METADATA = 'interceptors';

export function UseInterceptors(...interceptors: Function[]): ClassDecorator & MethodDecorator {
    return (target: any, propertyKey?: string | symbol, descriptor?: PropertyDescriptor) => {
        if (descriptor) {
            // Method decorator
            Reflect.defineMetadata(INTERCEPTORS_METADATA, interceptors, target, propertyKey!);
        } else {
            // Class decorator
            Reflect.defineMetadata(INTERCEPTORS_METADATA, interceptors, target);
        }
    };
}

export function getInterceptors(target: any, propertyKey?: string): Function[] {
    return propertyKey
        ? Reflect.getMetadata(INTERCEPTORS_METADATA, target, propertyKey) || []
        : Reflect.getMetadata(INTERCEPTORS_METADATA, target) || [];
}

// Built-in interceptors
export class LoggingInterceptor implements Interceptor {
    async intercept(context: ExecutionContext, next: CallHandler): Promise<any> {
        const className = context.getClass().name;
        const handlerName = context.getHandler().name;
        const now = Date.now();
        
        console.log(`[${new Date().toISOString()}] Before ${className}.${handlerName}`);
        
        const result = await next.handle();
        
        console.log(`[${new Date().toISOString()}] After ${className}.${handlerName} - ${Date.now() - now}ms`);
        
        return result;
    }
}

export class CacheInterceptor implements Interceptor {
    private cache = new Map<string, { data: any; expiry: number }>();
    
    constructor(private ttl: number = 60000) {} // 1 minute default
    
    async intercept(context: ExecutionContext, next: CallHandler): Promise<any> {
        const request = context.switchToHttp().getRequest();
        const cacheKey = `${request.method}:${request.url}`;
        
        // Check cache
        const cached = this.cache.get(cacheKey);
        if (cached && cached.expiry > Date.now()) {
            console.log(`Cache hit for ${cacheKey}`);
            return cached.data;
        }
        
        // Execute handler
        const result = await next.handle();
        
        // Cache the result
        if (request.method === 'GET') {
            this.cache.set(cacheKey, {
                data: result,
                expiry: Date.now() + this.ttl
            });
        }
        
        return result;
    }
}

export class TransformInterceptor implements Interceptor {
    async intercept(context: ExecutionContext, next: CallHandler): Promise<any> {
        const result = await next.handle();
        
        return {
            data: result,
            status: 'success',
            timestamp: new Date().toISOString(),
            path: context.switchToHttp().getRequest().path
        };
    }
}

export class TimeoutInterceptor implements Interceptor {
    constructor(private timeout: number = 5000) {} // 5 seconds default
    
    async intercept(context: ExecutionContext, next: CallHandler): Promise<any> {
        return Promise.race([
            next.handle(),
            new Promise((_, reject) => {
                setTimeout(() => {
                    reject(new Error(`Request timeout after ${this.timeout}ms`));
                }, this.timeout);
            })
        ]);
    }
}
