import 'reflect-metadata'

export const ROUTES_KEY = Symbol('routes');
function createRouteDecorator(method: string) {
    return function (path: string) {
        return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
            if (!Reflect.hasMetadata(ROUTES_KEY, target.constructor)) {
                Reflect.defineMetadata(ROUTES_KEY, [], target.constructor);
            }
            const routes = Reflect.getMetadata(ROUTES_KEY, target.constructor);
            routes.push({ method, path, handler: propertyKey });
            Reflect.defineMetadata(ROUTES_KEY, routes, target.constructor);
        };
    };
}

export const Get = createRouteDecorator('get');
export const Post = createRouteDecorator('post');
export const Put = createRouteDecorator('put');
export const Delete = createRouteDecorator('delete');
export const Patch = createRouteDecorator('patch');
export const All = createRouteDecorator('all');
export const Options = createRouteDecorator('options');
export const Head = createRouteDecorator('head');
export const Search = createRouteDecorator('search');
export const Propfind = createRouteDecorator('propfind');
export const Proppatch = createRouteDecorator('proppatch');
export const Copy = createRouteDecorator('copy');
export const Lock = createRouteDecorator('lock');
export const Unlock = createRouteDecorator('unlock');
export const Mkcol = createRouteDecorator('mkcol');
export const Move = createRouteDecorator('move');
