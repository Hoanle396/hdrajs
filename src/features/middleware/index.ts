import 'reflect-metadata';
import { Request, Response, NextFunction } from 'express';

export interface MiddlewareFunction {
    (req: Request, res: Response, next: NextFunction): void | Promise<void>;
}

export interface MiddlewareConsumer {
    apply(...middleware: MiddlewareFunction[]): MiddlewareConfigProxy;
}

export interface MiddlewareConfigProxy {
    forRoutes(...routes: string[] | Function[]): MiddlewareConfigProxy;
    exclude(...routes: string[]): MiddlewareConfigProxy;
}

const MIDDLEWARE_METADATA = 'middleware';

export function UseMiddleware(...middleware: MiddlewareFunction[]): ClassDecorator & MethodDecorator {
    return (target: any, propertyKey?: string | symbol, descriptor?: PropertyDescriptor) => {
        if (descriptor) {
            // Method decorator
            Reflect.defineMetadata(MIDDLEWARE_METADATA, middleware, target, propertyKey!);
        } else {
            // Class decorator
            Reflect.defineMetadata(MIDDLEWARE_METADATA, middleware, target);
        }
    };
}

export function getMiddleware(target: any, propertyKey?: string): MiddlewareFunction[] {
    return propertyKey
        ? Reflect.getMetadata(MIDDLEWARE_METADATA, target, propertyKey) || []
        : Reflect.getMetadata(MIDDLEWARE_METADATA, target) || [];
}

// Built-in middleware
export class CorsMiddleware {
    static create(options: {
        origin?: string | string[] | boolean;
        methods?: string[];
        allowedHeaders?: string[];
        credentials?: boolean;
    } = {}) {
        return (req: Request, res: Response, next: NextFunction) => {
            const {
                origin = '*',
                methods = ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE'],
                allowedHeaders = ['Content-Type', 'Authorization'],
                credentials = false
            } = options;

            if (typeof origin === 'string') {
                res.header('Access-Control-Allow-Origin', origin);
            } else if (Array.isArray(origin)) {
                const requestOrigin = req.get('Origin');
                if (requestOrigin && origin.includes(requestOrigin)) {
                    res.header('Access-Control-Allow-Origin', requestOrigin);
                }
            } else if (origin === true) {
                res.header('Access-Control-Allow-Origin', req.get('Origin') || '*');
            }

            res.header('Access-Control-Allow-Methods', methods.join(', '));
            res.header('Access-Control-Allow-Headers', allowedHeaders.join(', '));
            
            if (credentials) {
                res.header('Access-Control-Allow-Credentials', 'true');
            }

            if (req.method === 'OPTIONS') {
                res.sendStatus(200);
            } else {
                next();
            }
        };
    }
}

export class LoggerMiddleware {
    static create(format: string = ':method :url :status :response-time ms') {
        return (req: Request, res: Response, next: NextFunction) => {
            const start = Date.now();
            
            res.on('finish', () => {
                const duration = Date.now() - start;
                const log = format
                    .replace(':method', req.method)
                    .replace(':url', req.url)
                    .replace(':status', res.statusCode.toString())
                    .replace(':response-time', duration.toString());
                    
                console.log(log);
            });
            
            next();
        };
    }
}

export class RateLimitMiddleware {
    private static requests = new Map<string, { count: number; resetTime: number }>();
    
    static create(options: {
        windowMs?: number;
        max?: number;
        message?: string;
        keyGenerator?: (req: Request) => string;
    } = {}) {
        const {
            windowMs = 15 * 60 * 1000, // 15 minutes
            max = 100,
            message = 'Too many requests from this IP, please try again later.',
            keyGenerator = (req: Request) => req.ip
        } = options;

        return (req: Request, res: Response, next: NextFunction) => {
            const key = keyGenerator(req);
            if (!key) {
                return next();
            }
            
            const now = Date.now();
            const record = this.requests.get(key);

            if (!record || now > record.resetTime) {
                this.requests.set(key, {
                    count: 1,
                    resetTime: now + windowMs
                });
                next();
            } else if (record.count < max) {
                record.count++;
                next();
            } else {
                res.status(429).json({ message });
            }
        };
    }
}

export class CompressionMiddleware {
    static create() {
        return (req: Request, res: Response, next: NextFunction) => {
            const acceptEncoding = req.headers['accept-encoding'] || '';
            
            if (acceptEncoding.includes('gzip')) {
                res.setHeader('Content-Encoding', 'gzip');
                // Note: In a real implementation, you would use a compression library
                // This is a simplified placeholder
            }
            
            next();
        };
    }
}
