// Framework Interfaces
// This file contains shared interfaces used across the framework

export interface InjectionToken<T = any> {
    readonly description: string;
}

export interface OnModuleInit {
    onModuleInit?(): any;
}

export interface OnModuleDestroy {
    onModuleDestroy?(): any;
}

export interface OnApplicationBootstrap {
    onApplicationBootstrap?(): any;
}

export interface OnApplicationShutdown {
    onApplicationShutdown?(signal?: string): any;
}
