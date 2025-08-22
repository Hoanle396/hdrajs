#!/usr/bin/env node

import { program } from 'commander';
import * as fs from 'fs';
import * as path from 'path';

program
    .name('hdra')
    .description('HDRA.js CLI - Generate controllers, services, modules and more')
    .version('1.0.0');

// Generate controller
program
    .command('generate:controller')
    .alias('g:c')
    .argument('<name>', 'controller name')
    .option('-p, --path <path>', 'output path', './src')
    .description('Generate a new controller')
    .action((name: string, options: { path: string }) => {
        generateController(name, options.path);
    });

// Generate service
program
    .command('generate:service')
    .alias('g:s')
    .argument('<name>', 'service name')
    .option('-p, --path <path>', 'output path', './src')
    .description('Generate a new service')
    .action((name: string, options: { path: string }) => {
        generateService(name, options.path);
    });

// Generate module
program
    .command('generate:module')
    .alias('g:m')
    .argument('<name>', 'module name')
    .option('-p, --path <path>', 'output path', './src')
    .description('Generate a new module')
    .action((name: string, options: { path: string }) => {
        generateModule(name, options.path);
    });

// Generate guard
program
    .command('generate:guard')
    .alias('g:g')
    .argument('<name>', 'guard name')
    .option('-p, --path <path>', 'output path', './src')
    .description('Generate a new guard')
    .action((name: string, options: { path: string }) => {
        generateGuard(name, options.path);
    });

// Generate middleware
program
    .command('generate:middleware')
    .alias('g:md')
    .argument('<name>', 'middleware name')
    .option('-p, --path <path>', 'output path', './src')
    .description('Generate a new middleware')
    .action((name: string, options: { path: string }) => {
        generateMiddleware(name, options.path);
    });

function toPascalCase(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1).replace(/-([a-z])/g, (g) => g[1].toUpperCase());
}

function toKebabCase(str: string): string {
    return str.replace(/([A-Z])/g, '-$1').toLowerCase().replace(/^-/, '');
}

function generateController(name: string, outputPath: string): void {
    const className = toPascalCase(name);
    const fileName = toKebabCase(name);
    const template = `import { Controller, Get, Post, Put, Delete, Body, Param, Query } from 'hdrajs';

@Controller('/${toKebabCase(name)}')
export class ${className}Controller {
    
    @Get('/')
    findAll() {
        return { message: 'Get all ${name.toLowerCase()}s' };
    }

    @Get('/:id')
    findOne(@Param('id') id: string) {
        return { message: \`Get ${name.toLowerCase()} with id: \${id}\` };
    }

    @Post('/')
    create(@Body() createDto: any) {
        return { message: 'Create ${name.toLowerCase()}', data: createDto };
    }

    @Put('/:id')
    update(@Param('id') id: string, @Body() updateDto: any) {
        return { message: \`Update ${name.toLowerCase()} with id: \${id}\`, data: updateDto };
    }

    @Delete('/:id')
    remove(@Param('id') id: string) {
        return { message: \`Delete ${name.toLowerCase()} with id: \${id}\` };
    }
}
`;

    const filePath = path.join(outputPath, `${fileName}.controller.ts`);
    ensureDirectoryExists(path.dirname(filePath));
    fs.writeFileSync(filePath, template);
    console.log(`✅ Controller generated: ${filePath}`);
}

function generateService(name: string, outputPath: string): void {
    const className = toPascalCase(name);
    const fileName = toKebabCase(name);
    const template = `import { Injectable } from 'hdrajs';

@Injectable()
export class ${className}Service {
    
    findAll() {
        // TODO: Implement find all logic
        return [];
    }

    findOne(id: string) {
        // TODO: Implement find one logic
        return { id };
    }

    create(createDto: any) {
        // TODO: Implement create logic
        return { id: 'new-id', ...createDto };
    }

    update(id: string, updateDto: any) {
        // TODO: Implement update logic
        return { id, ...updateDto };
    }

    remove(id: string) {
        // TODO: Implement remove logic
        return { id, deleted: true };
    }
}
`;

    const filePath = path.join(outputPath, `${fileName}.service.ts`);
    ensureDirectoryExists(path.dirname(filePath));
    fs.writeFileSync(filePath, template);
    console.log(`✅ Service generated: ${filePath}`);
}

function generateModule(name: string, outputPath: string): void {
    const className = toPascalCase(name);
    const fileName = toKebabCase(name);
    const template = `import { Module } from 'hdrajs';
import { ${className}Controller } from './${fileName}.controller';
import { ${className}Service } from './${fileName}.service';

@Module({
    controllers: [${className}Controller],
    providers: [${className}Service]
})
export class ${className}Module {}
`;

    const filePath = path.join(outputPath, `${fileName}.module.ts`);
    ensureDirectoryExists(path.dirname(filePath));
    fs.writeFileSync(filePath, template);
    console.log(`✅ Module generated: ${filePath}`);
}

function generateGuard(name: string, outputPath: string): void {
    const className = toPascalCase(name);
    const fileName = toKebabCase(name);
    const template = `import { Request, Response, NextFunction } from 'express';

export function ${name}Guard(req: Request, res: Response, next: NextFunction) {
    // TODO: Implement your guard logic here
    // Example: Check authentication, authorization, etc.
    
    const isAuthorized = true; // Replace with your logic
    
    if (isAuthorized) {
        next();
    } else {
        res.status(403).json({ message: 'Access denied' });
    }
}
`;

    const filePath = path.join(outputPath, 'guards', `${fileName}.guard.ts`);
    ensureDirectoryExists(path.dirname(filePath));
    fs.writeFileSync(filePath, template);
    console.log(`✅ Guard generated: ${filePath}`);
}

function generateMiddleware(name: string, outputPath: string): void {
    const className = toPascalCase(name);
    const fileName = toKebabCase(name);
    const template = `import { Request, Response, NextFunction } from 'express';

export function ${name}Middleware(req: Request, res: Response, next: NextFunction) {
    // TODO: Implement your middleware logic here
    console.log(\`${className}Middleware: \${req.method} \${req.path}\`);
    
    // Call next() to continue to the next middleware or route handler
    next();
}
`;

    const filePath = path.join(outputPath, 'middleware', `${fileName}.middleware.ts`);
    ensureDirectoryExists(path.dirname(filePath));
    fs.writeFileSync(filePath, template);
    console.log(`✅ Middleware generated: ${filePath}`);
}

function ensureDirectoryExists(dirPath: string): void {
    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
    }
}

program.parse();
