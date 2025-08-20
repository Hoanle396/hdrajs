import { Request, Response, NextFunction } from 'express';
import { JsonObject } from 'swagger-ui-express';

// Core Types
export interface Type<T = {}> extends Function {
    new (...args: any[]): T;
}

export interface ClassDecorator<T = {}> {
    <TFunction extends Type<T>>(target: TFunction): TFunction | void;
}

export interface MethodDecorator {
    <T>(target: any, propertyKey: string | symbol, descriptor: TypedPropertyDescriptor<T>): TypedPropertyDescriptor<T> | void;
}

export interface ParameterDecorator {
    (target: any, propertyKey: string | symbol | undefined, parameterIndex: number): void;
}

// HTTP Types
export interface HttpContext {
    request: Request;
    response: Response;
    next: NextFunction;
    user?: any;
    metadata?: Record<string, any>;
}

export interface RouteDefinition {
    method: string;
    path: string;
    handler: string;
    middleware?: Function[];
    guards?: Function[];
    filters?: Function[];
}

// Configuration Types
export interface AppConfig {
    port?: number;
    cors?: {
        origin?: string | string[] | boolean;
        credentials?: boolean;
        methods?: string[];
    };
    swagger?: {
        document: JsonObject;
        path?: string;
        options?: any;
    };
    globalPrefix?: string;
    notFoundHandler?: (req: Request, res: Response) => void;
    exception?: (error: Error | HttpException, res: Response) => void;
    bodyParser?: {
        json?: any;
        urlencoded?: any;
    };
    staticAssets?: {
        path: string;
        options?: any;
    }[];
}

// Exception Types
export interface HttpException extends Error {
    status: number;
    code?: string;
    details?: any;
}

// Middleware Types
export interface MiddlewareFunction {
    (ctx: HttpContext): Promise<void> | void;
}

export interface Guard {
    canActivate(context: HttpContext): boolean | Promise<boolean>;
}

export interface ExceptionFilter {
    catch(exception: any, context: HttpContext): any;
}

// Validation Types
export interface ValidationPipe {
    transform(value: any, metadata: ValidationMetadata): any;
}

export interface ValidationMetadata {
    type: 'body' | 'query' | 'param' | 'header';
    metatype?: Type<any>;
    data?: string;
}

// Pipeline Types
export interface PipeTransform<T = any, R = any> {
    transform(value: T, metadata: ValidationMetadata): R;
}

// Interceptor Types
export interface CallHandler<T = any> {
    handle(): Promise<T>;
}

export interface ExecutionContext {
    getClass(): Type<any>;
    getHandler(): Function;
    getArgs(): any[];
    getArgByIndex<T = any>(index: number): T;
    switchToHttp(): HttpArgumentsHost;
}

export interface HttpArgumentsHost {
    getRequest<T = any>(): T;
    getResponse<T = any>(): T;
    getNext<T = any>(): T;
}

export interface NestInterceptor<T = any, R = any> {
    intercept(context: ExecutionContext, next: CallHandler<T>): Promise<R>;
}
