import 'reflect-metadata';
import { Response } from 'express';

export const EXCEPTION_FILTER_METADATA = 'exception_filter';

export interface HttpException {
    status: number;
    message: string;
    code?: string;
}

export class BadRequestException implements HttpException {
    status = 400;
    constructor(public message: string, public code?: string) { }
}

export class UnauthorizedException implements HttpException {
    status = 401;
    constructor(public message: string, public code?: string) { }
}

export class ForbiddenException implements HttpException {
    status = 403;
    constructor(public message: string, public code?: string) { }
}

export class NotFoundException implements HttpException {
    status = 404;
    constructor(public message: string, public code?: string) { }
}

export class InternalServerErrorException implements HttpException {
    status = 500;
    constructor(public message: string, public code?: string) { }
}

export type ExceptionFilter = (error: Error | HttpException, res: Response) => void;

export function UseFilters(...filters: ExceptionFilter[]) {
    return function (target: any, propertyKey?: string | symbol, descriptor?: PropertyDescriptor) {
        if (descriptor) {
            Reflect.defineMetadata(EXCEPTION_FILTER_METADATA, filters, target, propertyKey!);
        } else {
            Reflect.defineMetadata(EXCEPTION_FILTER_METADATA, filters, target);
        }
    };
}

export function getFilters(target: any, propertyKey?: string): ExceptionFilter[] {
    return propertyKey
        ? Reflect.getMetadata(EXCEPTION_FILTER_METADATA, target, propertyKey) || []
        : Reflect.getMetadata(EXCEPTION_FILTER_METADATA, target) || [];
}

export function defaultFilter(error: Error | HttpException, res: Response) {
    res.status(500).json({
        statusCode: 500,
        message: 'Internal server error',
        error: error.message
    });
};