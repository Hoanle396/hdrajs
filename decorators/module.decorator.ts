import 'reflect-metadata';

export interface ModuleMetadata {
    imports?: any[];
    controllers?: any[];
    providers?: any[];
}

const MODULE_METADATA = 'module';

export function Module(metadata: ModuleMetadata): ClassDecorator {
    return (target: any) => {
        Reflect.defineMetadata(MODULE_METADATA, metadata, target);
    };
}

export function getModuleMetadata(target: any): ModuleMetadata {
    return Reflect.getMetadata(MODULE_METADATA, target) || {};
}

export function loadModule(module: any) {
    const metadata = getModuleMetadata(module);

    // Load imported modules first
    if (metadata.imports) {
        metadata.imports.forEach(importedModule => loadModule(importedModule));
    }

    // Register controllers
    if (metadata.controllers) {
        if (!globalThis.controllers) {
            globalThis.controllers = [];
        }
        globalThis.controllers.push(...metadata.controllers);
    }

    // Register providers
    if (metadata.providers) {
        if (!globalThis.providers) {
            globalThis.providers = [];
        }
        globalThis.providers.push(...metadata.providers);
    }
}