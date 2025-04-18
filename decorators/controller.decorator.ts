export function Controller(prefix: string = '') {
    return function (target: any) {
        Reflect.defineMetadata('prefix', prefix, target);
        if (!globalThis.controllers) globalThis.controllers = [];
        globalThis.controllers.push(target);
    };
}
