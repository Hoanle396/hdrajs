import 'reflect-metadata';

const SWAGGER_METADATA = 'swagger';

export interface SwaggerMetadata {
    summary?: string;
    description?: string;
    tags?: string[];
    deprecated?: boolean;
    responses?: {
        [key: string]: {
            description: string;
            type?: string;
            schema?: any;
        }
    };
    security?: {
        bearerAuth?: string[];
        apiKeyAuth?: string[];
    }[];
    requestBody?: {
        description?: string;
        required?: boolean;
        content?: {
            [key: string]: {
                schema: any;
            };
        };
    };
}

export function ApiOperation(metadata: SwaggerMetadata) {
    return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
        const existingMetadata = Reflect.getMetadata(SWAGGER_METADATA, target, propertyKey) || {};
        Reflect.defineMetadata(SWAGGER_METADATA, { ...existingMetadata, ...metadata }, target, propertyKey);
    };
}

export function ApiTags(...tags: string[]) {
    return function (target: any) {
        const existingTags = Reflect.getMetadata('swagger:tags', target) || [];
        Reflect.defineMetadata('swagger:tags', [...existingTags, ...tags], target);
    };
}

export function ApiResponse(status: number, metadata: Partial<{
    description: string;
    type?: string;
    schema?: any;
}>) {
    return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
        const existingMetadata = Reflect.getMetadata(SWAGGER_METADATA, target, propertyKey) || {};
        const responses = existingMetadata.responses || {};
        responses[status] = metadata;
        Reflect.defineMetadata(SWAGGER_METADATA, { ...existingMetadata, responses }, target, propertyKey);
    };
}

export function ApiBody(metadata: SwaggerMetadata['requestBody']) {
    return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
        const existingMetadata = Reflect.getMetadata(SWAGGER_METADATA, target, propertyKey) || {};
        Reflect.defineMetadata(SWAGGER_METADATA, {
            ...existingMetadata,
            requestBody: metadata
        }, target, propertyKey);
    };
}

export function getSwaggerMetadata(target: any, propertyKey: string): SwaggerMetadata {
    return Reflect.getMetadata(SWAGGER_METADATA, target, propertyKey) || {};
}

export function getControllerTags(target: any): string[] {
    return Reflect.getMetadata('swagger:tags', target) || [];
}