```markdown
# HRA.js Framework

A lightweight TypeScript-based web framework with built-in dependency injection, decorators, and Swagger support.

## Features

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
// main.ts
import { createApp } from 'hdrajs';
import './src/users/user.controller';
import './src/users/user.service';

const app = createApp();

app.listen(4000, () => {
    console.log('Server running on http://localhost:4000');
});
```

```typescript
// user.controller.ts
import { Controller, Get, Post, Body, Param,ApiOperation, ApiTags } from 'hdrajs';

@Controller('/users')
@ApiTags('Users')
export class UserController {
    @Get('/:id')
    @ApiOperation({ summary: 'Get user by ID' })
    getUser(@Param('id') id: number) {
        return { id, name: 'John Doe' };
    }

    @Post('/')
    createUser(@Body() user: any) {
        return user;
    }
}
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

const app = createApp({
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

## Authentication

```typescript
import { UseGuards } from 'hdrajs';
import { authGuard } from './auth.guard';

@Controller('/protected')
@UseGuards(authGuard)
export class ProtectedController {
    @Get('/')
    getData() {
        return { message: 'Protected data' };
    }
}
```

## Exception Handling

```typescript
import { UseFilters, HttpExceptionFilter } from 'hdrajs';

@Controller('/users')
@UseFilters(HttpExceptionFilter)
export class UserController {
    @Get('/:id')
    getUser(@Param('id') id: number) {
        throw new NotFoundException(`User ${id} not found`);
    }
}
```

## Global Exception Filter

```typescript
const app = createApp({
    // ... orther config
    exception: HttpExceptionFilter
});
```

## API Documentation

Access Swagger UI at `/api-docs` after starting your application.

## License

MIT
```