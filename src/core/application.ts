import express, { Express, Request, Response, NextFunction } from 'express';
import 'reflect-metadata';

import { JsonObject, serve, setup } from 'swagger-ui-express';
import { 
    defaultFilter, 
    getControllerTags, 
    getFilters, 
    getGuards, 
    getParameterMetadata, 
    getSwaggerMetadata, 
    HttpException, 
    loadModule, 
    ModuleMetadata, 
    ParamType, 
    resolveDependencies, 
    ROUTES_KEY 
} from '../common/decorators';

// Import new features
import { container } from '../features/dependency-injection';
import { ValidationPipe, getPipes } from '../features/validation';
import { getMiddleware, MiddlewareFunction } from '../features/middleware';

declare global {
    var controllers: any[];
    var globalFilters: any[];
    var providers: any[];
}

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
    notFoundHandler?: ((req: any, res: any) => void) | null;
    exception?: (error: Error | HttpException, res: Response) => void;
    bodyParser?: {
        json?: any;
        urlencoded?: any;
    };
    staticAssets?: {
        path: string;
        options?: any;
    }[];
    middleware?: MiddlewareFunction[];
    globalPipes?: any[];
}

export function createApp(module: { new(): any } & { prototype: { [key: string]: any } }, options?: AppConfig): Express {
    const app = express();
    
    // Configure body parser
    if (options?.bodyParser?.json !== false) {
        app.use(express.json(options?.bodyParser?.json || {}));
    }
    if (options?.bodyParser?.urlencoded !== false) {
        app.use(express.urlencoded({ extended: true, ...options?.bodyParser?.urlencoded }));
    }

    // Apply global middleware
    if (options?.middleware) {
        options.middleware.forEach(middleware => app.use(middleware));
    }

    // CORS configuration
    if (options?.cors) {
        app.use((req: Request, res: Response, next: NextFunction) => {
            const { origin, methods, credentials } = options.cors!;
            
            if (origin) {
                res.header('Access-Control-Allow-Origin', Array.isArray(origin) ? origin.join(', ') : origin.toString());
            }
            if (methods) {
                res.header('Access-Control-Allow-Methods', methods.join(', '));
            }
            if (credentials) {
                res.header('Access-Control-Allow-Credentials', 'true');
            }
            
            res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
            
            if (req.method === 'OPTIONS') {
                res.sendStatus(200);
            } else {
                next();
            }
        });
    }

    // Static assets
    if (options?.staticAssets) {
        options.staticAssets.forEach(({ path, options: staticOptions }) => {
            app.use(express.static(path, staticOptions));
        });
    }

    const metadata: ModuleMetadata = Reflect.getMetadata('module', module) || {};
    if (metadata.imports) {
        metadata.imports.forEach(importedModule => loadModule(importedModule));
    }
    if (metadata.controllers) {
        if (!globalThis.controllers) globalThis.controllers = [];
        globalThis.controllers.push(...metadata.controllers);
    }
    if (metadata.providers) {
        if (!globalThis.providers) globalThis.providers = [];
        globalThis.providers.push(...metadata.providers);
    }
    const controllers = globalThis.controllers || [];
    controllers.forEach((ControllerClass: any) => {
        try {
            const prefix = Reflect.getMetadata('prefix', ControllerClass);
            const tags = getControllerTags(ControllerClass);
            
            // Try to use the new DI container first, fallback to old resolveDependencies
            let instance;
            try {
                instance = container.get(ControllerClass);
            } catch (error) {
                // Fallback to legacy dependency resolution
                instance = new ControllerClass(...resolveDependencies(ControllerClass));
            }
            
            const routes = Reflect.getMetadata(ROUTES_KEY, ControllerClass) || [];
            routes.forEach((route: any) => {
                const swaggerMeta = getSwaggerMetadata(instance, route.handler);
                const params = getParameterMetadata(instance, route.handler);
                const pipes = getPipes(instance, route.handler);
                const classMiddleware = getMiddleware(ControllerClass);
                const methodMiddleware = getMiddleware(instance, route.handler);

                if (options?.swagger?.document) {
                    const path = (options.globalPrefix || '') + prefix + route.path;
                    if (!options.swagger.document.paths[path]) {
                        options.swagger.document.paths[path] = {};
                    }

                    options.swagger.document.paths[path][route.method] = {
                        tags: tags,
                        ...swaggerMeta,
                        parameters: params.map(param => {
                            switch (param.type) {
                                case ParamType.PARAM:
                                    return {
                                        name: param.name,
                                        in: 'path',
                                        required: true,
                                        schema: { type: 'string' }
                                    };
                                case ParamType.QUERY:
                                    return {
                                        name: param.name,
                                        in: 'query',
                                        schema: { type: 'string' }
                                    };
                                default:
                                    return null;
                            }
                        }).filter(p => p !== null)
                    };
                }
                
                const classGuards = getGuards(ControllerClass);
                const methodGuards = getGuards(instance, route.handler);
                const guards = [...classGuards, ...methodGuards];

                const allMiddleware = [...classMiddleware, ...methodMiddleware];
                const globalPipes = options?.globalPipes || [];
                const allPipes = [...globalPipes, ...pipes];

                const handlers = [
                    ...allMiddleware,
                    ...guards.map(guard => (req: Request, res: Response, next: Function) => guard(req, res, next)),
                    async (req: Request, res: Response) => {
                        const requestId = Math.random().toString(36);
                        
                        try {
                            const handler = instance[route.handler];
                            const params = getParameterMetadata(instance, route.handler);
                            
                            // Process parameters through pipes
                            const args = await Promise.all(params.map(async param => {
                                let value: any;
                                
                                switch (param.type) {
                                    case ParamType.BODY:
                                        value = req.body;
                                        break;
                                    case ParamType.PARAM:
                                        value = req.params[param.name!];
                                        break;
                                    case ParamType.QUERY:
                                        value = param.name ? req.query[param.name!] : req.query;
                                        break;
                                    default:
                                        value = undefined;
                                }

                                // Apply pipes to transform/validate the value
                                for (const pipe of allPipes) {
                                    if (typeof pipe === 'function') {
                                        const pipeInstance = new pipe();
                                        if (pipeInstance.transform) {
                                            value = await pipeInstance.transform(value, {
                                                type: param.type,
                                                metatype: param.dto,
                                                data: param.name
                                            });
                                        }
                                    }
                                }

                                return value;
                            }));
                            
                            const result = await handler.apply(instance, args);
                            
                            if (result === undefined) {
                                res.status(204).send();
                            } else {
                                res.json(result);
                            }
                        } catch (error: any) {
                            const globalFilter = options?.exception;
                            const methodFilters = getFilters(instance, route.handler);
                            const classFilters = getFilters(ControllerClass);

                            // Priority: method filters > class filters > global filters > default filter
                            const filter = methodFilters[0] || classFilters[0] || globalFilter || defaultFilter;
                            filter(error, res);
                        } finally {
                            // Clean up request-scoped dependencies
                            if (container.clearRequestScope) {
                                container.clearRequestScope(requestId);
                            }
                        }
                    }
                ];

                const fullPath = (options?.globalPrefix || '') + prefix + route.path;
                (app as any)[route.method](fullPath, ...handlers);
            });
        } catch (err) {
            console.error('Error registering controller:', ControllerClass?.name, err);
        }
    });

    if (options?.swagger) {
        const { document, path = '/api-docs' } = options?.swagger;
        app.use(path, serve, setup(document));
    }

    app.use((req: any, res: any) => {
        if (options?.notFoundHandler) {
            options.notFoundHandler(req, res);
        }
        else {
            res.status(404).send('Not Found');
        }
    })
    return app;
}