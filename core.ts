import express, { Express, Request, Response } from 'express';
import 'reflect-metadata';

import { JsonObject, serve, setup } from 'swagger-ui-express';
import { defaultFilter, getControllerTags, getFilters, getGuards, getParameterMetadata, getSwaggerMetadata, HttpException, ParamType, resolveDependencies, ROUTES_KEY } from './decorators';

declare global {
    var controllers: any[];
    var globalFilters: any[];
}

export type App = {
    swagger?: {
        document: JsonObject,
        path: string
    }
    notFoundHandler?: ((req: any, res: any) => void) | null;
    exception?: (error: Error | HttpException, res: Response) => void;
}

export function createApp(options: App): Express {
    const app = express();
    app.use(express.json());
    const controllers = globalThis.controllers || [];
    controllers.forEach((ControllerClass: any) => {
        try {
            const prefix = Reflect.getMetadata('prefix', ControllerClass);
            const tags = getControllerTags(ControllerClass);
            const instance = new ControllerClass(...resolveDependencies(ControllerClass));
            const routes = Reflect.getMetadata(ROUTES_KEY, ControllerClass) || [];
            routes.forEach((route: any) => {
                const swaggerMeta = getSwaggerMetadata(instance, route.handler);
                const params = getParameterMetadata(instance, route.handler);

                if (options?.swagger?.document) {
                    const path = prefix + route.path;
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

                const handlers = [
                    ...guards.map(guard => (req: Request, res: Response, next: Function) => guard(req, res, next)),
                    async (req: Request, res: Response) => {
                        try {
                            const handler = instance[route.handler];
                            const params = getParameterMetadata(instance, route.handler);
                            const args = params.map(param => {
                                switch (param.type) {
                                    case ParamType.BODY:
                                        return req.body;
                                    case ParamType.PARAM:
                                        return req.params[param.name!];
                                    case ParamType.QUERY:
                                        return param.name ? req.query[param.name!] : req.query;
                                    default:
                                        return undefined;
                                }
                            });
                            const result = await handler.apply(instance, args);
                            res.json(result);
                        } catch (error: any) {
                            const globalFilter = options?.exception;
                            const methodFilters = getFilters(instance, route.handler);
                            const classFilters = getFilters(ControllerClass);

                            // Priority: method filters > class filters > global filters > default filter
                            const filter = methodFilters[0] || classFilters[0] || globalFilter || defaultFilter;
                            filter(error, res);
                        }
                    }
                ];

                (app as any)[route.method](prefix + route.path, ...handlers);
            });
        } catch (err) {
            console.error('Error registering controller:', ControllerClass?.name, err);
        }
    });

    if (options.swagger) {
        const { document, path = '/api-docs' } = options.swagger;
        app.use(path, serve, setup(document));
    }

    app.use((req: any, res: any) => {
        if (options.notFoundHandler) {
            options.notFoundHandler(req, res);
        }
        else {
            res.status(404).send('Not Found');
        }
    })
    return app;
}