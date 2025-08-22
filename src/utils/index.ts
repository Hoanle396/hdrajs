// Utility Functions
// This file contains helper functions and utilities used across the framework

export function toPascalCase(str: string): string {
    return str.replace(/(^\w|[^a-zA-Z0-9]+\w)/g, match => match.slice(-1).toUpperCase()).replace(/[^a-zA-Z0-9]/g, '');
}

export function toKebabCase(str: string): string {
    return str.replace(/([a-z0-9]|(?=[A-Z]))([A-Z])/g, '$1-$2').toLowerCase();
}

export function toCamelCase(str: string): string {
    return str.replace(/([-_]\w)/g, g => g[1].toUpperCase());
}

export function isFunction(value: any): value is Function {
    return typeof value === 'function';
}

export function isString(value: any): value is string {
    return typeof value === 'string';
}

export function isUndefined(value: any): value is undefined {
    return typeof value === 'undefined';
}

export function isNil(value: any): value is null | undefined {
    return value === null || value === undefined;
}
