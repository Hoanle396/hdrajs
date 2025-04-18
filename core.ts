import express, { Express, Request, Response } from 'express';
import 'reflect-metadata';
import { getParameterMetadata, ParamType, resolveDependencies, ROUTES_KEY } from './decorators';

declare global {
    var controllers: any[];
}

export function createApp(): Express {
    const app = express();
    app.use(express.json());
    const controllers = globalThis.controllers || [];
    controllers.forEach((ControllerClass: any) => {
        try {
            const prefix = Reflect.getMetadata('prefix', ControllerClass);
            const instance = new ControllerClass(...resolveDependencies(ControllerClass));
            const routes = Reflect.getMetadata(ROUTES_KEY, ControllerClass) || [];
            routes.forEach((route: any) => {
                (app as any)[route.method](prefix + route.path, async (req: Request, res: Response) => {
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
                        res.status(500).json({ error: error.message });
                    }
                });
            });
        } catch (err) {
            console.error('Error registering controller:', ControllerClass?.name, err);
        }
    });

    app.use((req: any, res: any) => {
        if (notFoundHandler) {
            notFoundHandler(req, res);
        }
        else {
            res.status(404).send('Not Found');
        }
    })
    return app;
}


let notFoundHandler: ((req: any, res: any) => void) | null = null;

export function setNotFoundHandler(handler: (req: any, res: any) => void) {
    notFoundHandler = handler;
}