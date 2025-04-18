import 'reflect-metadata';

const PARAMS_METADATA = 'params';

export enum ParamType {
    BODY = 'body',
    PARAM = 'param',
    QUERY = 'query'
}

interface ParamMetadata {
    index: number;
    type: ParamType;
    name?: string;
    dto?: any;
}

export function Body(dto?: any) {
    return (target: any, propertyKey: string | symbol, parameterIndex: number) => {
        const existingParams: ParamMetadata[] = Reflect.getMetadata(PARAMS_METADATA, target, propertyKey) || [];
        existingParams[parameterIndex] = { index: parameterIndex, type: ParamType.BODY, dto };
        Reflect.defineMetadata(PARAMS_METADATA, existingParams, target, propertyKey);
    };
}

export function Param(name: string) {
    return (target: any, propertyKey: string | symbol, parameterIndex: number) => {
        const existingParams: ParamMetadata[] = Reflect.getMetadata(PARAMS_METADATA, target, propertyKey) || [];
        existingParams[parameterIndex] = { index: parameterIndex, type: ParamType.PARAM, name };
        Reflect.defineMetadata(PARAMS_METADATA, existingParams, target, propertyKey);
    };
}

export function Query(name?: string) {
    return (target: any, propertyKey: string | symbol, parameterIndex: number) => {
        const existingParams: ParamMetadata[] = Reflect.getMetadata(PARAMS_METADATA, target, propertyKey) || [];
        existingParams[parameterIndex] = { index: parameterIndex, type: ParamType.QUERY, name };
        Reflect.defineMetadata(PARAMS_METADATA, existingParams, target, propertyKey);
    };
}

export function getParameterMetadata(target: any, propertyKey: string): ParamMetadata[] {
    const params = Reflect.getMetadata(PARAMS_METADATA, target, propertyKey) || [];
    return params.filter((p: any) => p !== undefined);
}