import 'reflect-metadata';

const InjectableMap = new Map();

export function Injectable() {
    return function (target: any) {
        // Store class metadata
        Reflect.defineMetadata('injectable', true, target);

        // Legacy support - keep the old map for backward compatibility
        InjectableMap.set(target, new target());
    };
}

export function resolveDependencies(target: any): any {
    const paramTypes: any[] = Reflect.getMetadata('design:paramtypes', target) || [];
    return paramTypes.map((type: any) => {
        // Check if it's in the old injectable map first (backward compatibility)
        if (InjectableMap.has(type)) {
            return InjectableMap.get(type);
        }

        // Try to create a new instance if it's marked as injectable
        if (Reflect.getMetadata('injectable', type)) {
            const dependencies = resolveDependencies(type);
            return new type(...dependencies);
        }

        // Return undefined if not injectable
        return undefined;
    }).filter((dep: any) => dep !== undefined);
}