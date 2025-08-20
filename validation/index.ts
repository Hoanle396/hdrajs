import 'reflect-metadata';

export interface ValidationRule {
    validate(value: any): boolean | string;
}

export interface ValidationSchema {
    [key: string]: ValidationRule[];
}

// Built-in validation rules
export class IsRequired implements ValidationRule {
    validate(value: any): boolean | string {
        return value !== undefined && value !== null && value !== '' || 'Field is required';
    }
}

export class IsString implements ValidationRule {
    validate(value: any): boolean | string {
        return typeof value === 'string' || 'Value must be a string';
    }
}

export class IsNumber implements ValidationRule {
    validate(value: any): boolean | string {
        return typeof value === 'number' && !isNaN(value) || 'Value must be a number';
    }
}

export class IsEmail implements ValidationRule {
    validate(value: any): boolean | string {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(value) || 'Value must be a valid email';
    }
}

export class MinLength implements ValidationRule {
    constructor(private min: number) {}
    
    validate(value: any): boolean | string {
        return (typeof value === 'string' && value.length >= this.min) || 
               `Value must be at least ${this.min} characters long`;
    }
}

export class MaxLength implements ValidationRule {
    constructor(private max: number) {}
    
    validate(value: any): boolean | string {
        return (typeof value === 'string' && value.length <= this.max) || 
               `Value must be at most ${this.max} characters long`;
    }
}

export class IsIn implements ValidationRule {
    constructor(private values: any[]) {}
    
    validate(value: any): boolean | string {
        return this.values.includes(value) || 
               `Value must be one of: ${this.values.join(', ')}`;
    }
}

// Validation decorators
const VALIDATION_METADATA = 'validation';

export function ValidateRequired() {
    return addValidationRule(new IsRequired());
}

export function ValidateString() {
    return addValidationRule(new IsString());
}

export function ValidateNumber() {
    return addValidationRule(new IsNumber());
}

export function ValidateEmail() {
    return addValidationRule(new IsEmail());
}

export function ValidateMinLength(min: number) {
    return addValidationRule(new MinLength(min));
}

export function ValidateMaxLength(max: number) {
    return addValidationRule(new MaxLength(max));
}

export function ValidateIsIn(values: any[]) {
    return addValidationRule(new IsIn(values));
}

function addValidationRule(rule: ValidationRule): PropertyDecorator {
    return (target: any, propertyKey: string | symbol) => {
        const existingRules = Reflect.getMetadata(VALIDATION_METADATA, target, propertyKey) || [];
        existingRules.push(rule);
        Reflect.defineMetadata(VALIDATION_METADATA, existingRules, target, propertyKey);
    };
}

// Validation pipe
export class ValidationPipe {
    async transform(value: any, metadata: any): Promise<any> {
        if (!metadata.metatype || !this.toValidate(metadata.metatype)) {
            return value;
        }

        const object = this.plainToClass(metadata.metatype, value);
        const errors = await this.validate(object);
        
        if (errors.length > 0) {
            throw new ValidationException(errors);
        }
        
        return object;
    }

    private toValidate(metatype: Function): boolean {
        const types: Function[] = [String, Boolean, Number, Array, Object];
        return !types.includes(metatype);
    }

    private plainToClass(cls: any, plain: any): any {
        const instance = new cls();
        Object.assign(instance, plain);
        return instance;
    }

    private async validate(object: any): Promise<string[]> {
        const errors: string[] = [];
        const prototype = Object.getPrototypeOf(object);
        
        for (const propertyKey of Object.getOwnPropertyNames(prototype.constructor.prototype)) {
            if (propertyKey === 'constructor') continue;
            
            const rules: ValidationRule[] = Reflect.getMetadata(VALIDATION_METADATA, prototype, propertyKey) || [];
            const value = object[propertyKey];
            
            for (const rule of rules) {
                const result = rule.validate(value);
                if (typeof result === 'string') {
                    errors.push(`${propertyKey}: ${result}`);
                }
            }
        }
        
        return errors;
    }
}

export class ValidationException extends Error {
    constructor(public errors: string[]) {
        super(`Validation failed: ${errors.join(', ')}`);
        this.name = 'ValidationException';
    }
}

// Pipe decorator
const PIPES_METADATA = 'pipes';

export function UsePipes(...pipes: any[]): MethodDecorator {
    return (target: any, propertyKey: string | symbol, descriptor: PropertyDescriptor) => {
        Reflect.defineMetadata(PIPES_METADATA, pipes, target, propertyKey);
    };
}

export function getPipes(target: any, propertyKey: string): any[] {
    return Reflect.getMetadata(PIPES_METADATA, target, propertyKey) || [];
}
