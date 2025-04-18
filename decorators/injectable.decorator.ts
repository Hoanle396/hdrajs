const InjectableMap = new Map();

export function Injectable() {
    return function (target: any) {
        InjectableMap.set(target, new target());
    };
}

export function resolveDependencies(target: any) {
    const paramTypes = Reflect.getMetadata('design:paramtypes', target) || [];
    return paramTypes.map((type: any) => InjectableMap.get(type));
}