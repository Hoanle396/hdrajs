import 'reflect-metadata';

// Injection tokens
export const INJECTABLE_METADATA = 'injectable';
export const INJECT_METADATA = 'inject';
export const OPTIONAL_METADATA = 'optional';
export const SCOPE_METADATA = 'scope';

export enum Scope {
    SINGLETON = 'singleton',
    REQUEST = 'request',
    TRANSIENT = 'transient'
}

export interface Provider {
    provide: any;
    useClass?: any;
    useValue?: any;
    useFactory?: (...args: any[]) => any;
    inject?: any[];
    scope?: Scope;
}

export interface InjectableOptions {
    scope?: Scope;
}

class DIContainer {
    private providers = new Map<any, Provider>();
    private instances = new Map<any, any>();
    private requestInstances = new Map<any, any>();

    register(provider: Provider): void {
        this.providers.set(provider.provide, provider);
    }

    get<T>(token: any, requestId?: string): T {
        const provider = this.providers.get(token);
        if (!provider) {
            throw new Error(`Provider for ${token.name || token.toString()} not found`);
        }

        const scope = provider.scope || Scope.SINGLETON;
        const cacheKey = requestId && scope === Scope.REQUEST ? `${requestId}_${token}` : token;

        // Check cache based on scope
        if (scope === Scope.SINGLETON && this.instances.has(cacheKey)) {
            return this.instances.get(cacheKey);
        }

        if (scope === Scope.REQUEST && requestId && this.requestInstances.has(cacheKey)) {
            return this.requestInstances.get(cacheKey);
        }

        let instance: T;

        if (provider.useValue !== undefined) {
            instance = provider.useValue;
        } else if (provider.useFactory) {
            const deps = (provider.inject || []).map(dep => this.get(dep, requestId));
            instance = provider.useFactory(...deps);
        } else if (provider.useClass) {
            instance = this.createInstance(provider.useClass, requestId);
        } else {
            instance = this.createInstance(provider.provide, requestId);
        }

        // Cache based on scope
        if (scope === Scope.SINGLETON) {
            this.instances.set(cacheKey, instance);
        } else if (scope === Scope.REQUEST && requestId) {
            this.requestInstances.set(cacheKey, instance);
        }

        return instance;
    }

    private createInstance<T>(target: any, requestId?: string): T {
        const paramTypes = Reflect.getMetadata('design:paramtypes', target) || [];
        const dependencies = paramTypes.map((type: any, index: number) => {
            const injectToken = Reflect.getMetadata(INJECT_METADATA, target, index.toString());
            const isOptional = Reflect.getMetadata(OPTIONAL_METADATA, target, index.toString());
            
            try {
                return this.get(injectToken || type, requestId);
            } catch (error) {
                if (isOptional) {
                    return null;
                }
                throw error;
            }
        });

        return new target(...dependencies);
    }

    clearRequestScope(requestId: string): void {
        const keysToDelete = Array.from(this.requestInstances.keys())
            .filter(key => key.startsWith(`${requestId}_`));
        
        keysToDelete.forEach(key => {
            this.requestInstances.delete(key);
        });
    }
}

export const container = new DIContainer();

// Decorators
export function Injectable(options: InjectableOptions = {}): ClassDecorator {
    return (target: any) => {
        Reflect.defineMetadata(INJECTABLE_METADATA, true, target);
        Reflect.defineMetadata(SCOPE_METADATA, options.scope || Scope.SINGLETON, target);
        
        // Auto-register as provider
        container.register({
            provide: target,
            useClass: target,
            scope: options.scope
        });
        
        // Also maintain backward compatibility with the old injectable decorator
        Reflect.defineMetadata('injectable', true, target);
    };
}

export function Inject(token: any): ParameterDecorator {
    return (target: any, propertyKey: string | symbol | undefined, parameterIndex: number) => {
        Reflect.defineMetadata(INJECT_METADATA, token, target, parameterIndex.toString());
    };
}

export function Optional(): ParameterDecorator {
    return (target: any, propertyKey: string | symbol | undefined, parameterIndex: number) => {
        Reflect.defineMetadata(OPTIONAL_METADATA, true, target, parameterIndex.toString());
    };
}

// Provider registration helpers
export function createProvider(provider: Provider): Provider {
    container.register(provider);
    return provider;
}

export function resolveDependencies(target: any, requestId?: string): any[] {
    const paramTypes = Reflect.getMetadata('design:paramtypes', target) || [];
    return paramTypes.map((type: any, index: number) => {
        const injectToken = Reflect.getMetadata(INJECT_METADATA, target, index.toString());
        const isOptional = Reflect.getMetadata(OPTIONAL_METADATA, target, index.toString());
        
        try {
            return container.get(injectToken || type, requestId);
        } catch (error) {
            if (isOptional) {
                return null;
            }
            throw error;
        }
    });
}
