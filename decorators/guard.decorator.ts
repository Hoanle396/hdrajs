import 'reflect-metadata';

const GUARDS_METADATA = 'guards';

export function UseGuards(...guards: Function[]) {
    return function (target: any, propertyKey?: string | symbol, descriptor?: PropertyDescriptor) {
        if (descriptor) {
            // Method decorator
            Reflect.defineMetadata(GUARDS_METADATA, guards, target, propertyKey!);
        } else {
            // Class decorator
            Reflect.defineMetadata(GUARDS_METADATA, guards, target);
        }
    };
}

export function getGuards(target: any, propertyKey?: string): Function[] {
    return propertyKey
        ? Reflect.getMetadata(GUARDS_METADATA, target, propertyKey) || []
        : Reflect.getMetadata(GUARDS_METADATA, target) || [];
}