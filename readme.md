I'll update the README to reflect the new module-based architecture:

```markdown:d:\Code\hrajs\readme.md
# HRA.js Framework

A lightweight TypeScript-based web framework with built-in dependency injection, decorators, and Swagger support.

## Features

- Module-based architecture
- Decorator-based routing and controllers
- Built-in dependency injection
- Parameter decorators (@Body, @Query, @Param)
- Swagger/OpenAPI documentation
- Authentication guards
- Exception filters
- Global error handling

## Installation

```bash
npm install hdrajs
```

## Quick Start

```typescript
// app.module.ts
import { Module } from 'hdrajs';
import { UserController } from './users/user.controller';
import { UserService } from './users/user.service';

@Module({
    controllers: [UserController],
    providers: [UserService]
})
export class AppModule {}
```

```typescript
// main.ts
import { createApp } from 'hdrajs';
import { AppModule } from './app.module';

const swaggerDoc = {
    openapi: '3.0.0',
    info: {
        title: 'My API',
        version: '1.0.0',
        description: 'API documentation'
    },
    paths: {},
    components: {
        schemas: {}
    }
};

const app = createApp(AppModule, {
    swagger: {
        document: swaggerDoc,
        path: '/api-docs'
    }
});

app.listen(4000, () => {
    console.log('Server running on http://localhost:4000');
});
```

```typescript
// user.controller.ts
import { Controller, Get, Post, Body, Param } from 'hdrajs';
import { ApiOperation, ApiTags } from 'hdrajs/swagger';

@Controller('/users')
@ApiTags('Users')
export class UserController {
    constructor(private userService: UserService) {}

    @Get('/:id')
    @ApiOperation({ summary: 'Get user by ID' })
    getUser(@Param('id') id: number) {
        return this.userService.findById(id);
    }

    @Post('/')
    createUser(@Body() user: any) {
        return this.userService.create(user);
    }
}
```

## Module Structure

```typescript
// feature.module.ts
import { Module } from 'hdrajs';

@Module({
    imports: [OtherModule],      // Import other modules
    controllers: [Controller1],   // Register controllers
    providers: [Service1]        // Register services
})
export class FeatureModule {}
```

## Swagger

```typescript
import { JsonObject } from 'swagger-ui-express';
import { createApp } from '../core';
import './src/users/user.controller';
import './src/users/user.service';
import { HttpExceptionFilter } from './src/filters/http-exception.filter';

const swaggerDoc: JsonObject = {
    openapi: '3.0.0',
    info: {
        title: 'HRA.js API',
        version: '1.0.0',
        description: 'API documentation for HRA.js framework'
    },
    paths: {},
    components: {
        schemas: {},
        securitySchemes: {
            bearerAuth: {
                type: 'http',
                scheme: 'bearer',
                bearerFormat: 'JWT'
            }
        }
    },
};

const app = createApp(AppModule,{
    swagger: {
        document: swaggerDoc,
        path: '/api-docs'
    },
    exception: HttpExceptionFilter
});

app.listen(4000, () => {
    console.log('Server running on http://localhost:4000');
})
```

## Exception Handling

```typescript
// Global exception filter
const app = createApp(AppModule, {
    exception: HttpExceptionFilter
});

// Controller-level filter
@Controller('/users')
@UseFilters(CustomExceptionFilter)
export class UserController {}

// Method-level filter
@Get('/:id')
@UseFilters(SpecificExceptionFilter)
getUser(@Param('id') id: number) {}
```

## Authentication Guards

```typescript
@Controller('/protected')
@UseGuards(AuthGuard)
export class ProtectedController {
    @Get('/')
    @UseGuards(RoleGuard)
    getData() {
        return { message: 'Protected data' };
    }
}
```

## License

MIT
```