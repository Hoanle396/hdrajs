# HDRA.js Framework v1.0 Enhanced Edition

![npm version](https://img.shields.io/npm/v/hdrajs.svg)
![license](https://img.shields.io/npm/l/hdrajs.svg)
![downloads](https://img.shields.io/npm/dm/hdrajs.svg)

A powerful, lightweight TypeScript-based web framework built for modern Node.js applications. HDRA.js combines the simplicity of Express.js with advanced enterprise features like dependency injection, decorators, validation, middleware, interceptors, and CLI tools.

## 🚀 Key Features

### Core Framework
- **🏗️ Module-based Architecture** - Organize code with decorators and modules
- **💉 Advanced Dependency Injection** - Full DI container with singleton, request, and transient scopes
- **🎯 Decorator-based Routing** - Clean, declarative API design with TypeScript decorators
- **✅ Built-in Validation** - Type-safe validation with comprehensive decorator system
- **🛡️ Guards & Middleware** - Authentication, authorization, and request processing pipeline

### Advanced Features
- **🔄 Interceptors** - Transform requests and responses with powerful interceptor system
- **📚 Swagger/OpenAPI** - Auto-generated API documentation
- **🚀 High Performance** - Optimized request handling with async/await and caching
- **🛠️ CLI Tools** - Generate boilerplate code quickly (controllers, services, modules, guards)
- **🔧 Global Error Handling** - Centralized exception handling with custom filters
- **⚡ Hot Reload** - Development-friendly with automatic code reloading

## � Installation

```bash
npm install hdrajs
# or
yarn add hdrajs
# or
bun add hdrajs
```

## 🏃‍♂️ Quick Start

Let's build a complete API in minutes!

### 1. Create a Service

```typescript
import { Injectable } from 'hdrajs';

@Injectable()
export class UserService {
    private users = [
        { id: 1, name: 'John Doe', email: 'john@example.com' }
    ];

    findAll() {
        return this.users;
    }

    findById(id: number) {
        return this.users.find(user => user.id === id);
    }

    create(userData: { name: string; email: string }) {
        const newUser = { id: Date.now(), ...userData };
        this.users.push(newUser);
        return newUser;
    }
}
```

### 2. Create a Controller with Validation

```typescript
import { 
    Controller, 
    Get, 
    Post, 
    Body, 
    Param,
    ApiTags,
    ApiOperation,
    UsePipes,
    ValidationPipe,
    ValidateRequired,
    ValidateString,
    ValidateEmail
} from 'hdrajs';

export class CreateUserDto {
    @ValidateRequired()
    @ValidateString()
    name!: string;

    @ValidateRequired()
    @ValidateEmail()
    email!: string;
}

@Controller('/users')
@ApiTags('Users')
export class UserController {
    constructor(private userService: UserService) {}

    @Get('/')
    @ApiOperation({ summary: 'Get all users' })
    getAll() {
        return this.userService.findAll();
    }

    @Get('/:id')
    @ApiOperation({ summary: 'Get user by ID' })
    getUser(@Param('id') id: string) {
        return this.userService.findById(Number(id));
    }

    @Post('/')
    @UsePipes(ValidationPipe)
    @ApiOperation({ summary: 'Create new user' })
    createUser(@Body() createUserDto: CreateUserDto) {
        return this.userService.create(createUserDto);
    }
}
```

### 3. Create a Module

```typescript
import { Module } from 'hdrajs';
import { UserController } from './user.controller';
import { UserService } from './user.service';

@Module({
    controllers: [UserController],
    providers: [UserService]
})
export class AppModule {}
```

### 4. Bootstrap the Application

```typescript
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
    components: { schemas: {} }
};

const app = createApp(AppModule, {
    globalPrefix: '/api',
    swagger: {
        document: swaggerDoc,
        path: '/api-docs'
    },
    cors: {
        origin: true,
        credentials: true
    },
    middleware: [
        LoggerMiddleware.create()
    ]
});

app.listen(3000, () => {
    console.log('🚀 Server running on http://localhost:3000');
    console.log('📚 API Docs: http://localhost:3000/api-docs');
});
```

## 💉 Dependency Injection Deep Dive

HDRA.js provides a powerful dependency injection system with three scopes:

### Provider Scopes

```typescript
import { Injectable, Scope } from 'hdrajs';

// Singleton (default) - One instance per application
@Injectable()
export class ConfigService {
    private config = { apiUrl: 'https://api.example.com' };
    getConfig() { return this.config; }
}

// Request-scoped - New instance per HTTP request
@Injectable({ scope: Scope.REQUEST })
export class RequestService {
    private requestId = Math.random().toString(36);
    getRequestId() { return this.requestId; }
}

// Transient - New instance every time it's injected
@Injectable({ scope: Scope.TRANSIENT })
export class UtilityService {
    generateId() { return Date.now().toString(); }
}
```

### Constructor Injection

```typescript
@Injectable()
export class UserService {
    constructor(
        private configService: ConfigService,
        private requestService: RequestService,
        private utilityService: UtilityService
    ) {}

    async createUser(userData: any) {
        const config = this.configService.getConfig();
        const requestId = this.requestService.getRequestId();
        const userId = this.utilityService.generateId();
        
        console.log(`Creating user in request ${requestId}`);
        // User creation logic...
    }
}
```

### Advanced DI Features

```typescript
import { Injectable, Inject, Optional } from 'hdrajs';

@Injectable()
export class DatabaseService {
    constructor(
        @Inject('DATABASE_URL') private dbUrl: string,
        @Inject('DATABASE_OPTIONS') private options: any,
        @Optional() private logger?: LoggerService
    ) {
        console.log(`Connecting to database: ${dbUrl}`);
    }
}

// Register providers with tokens
@Module({
    providers: [
        DatabaseService,
        {
            provide: 'DATABASE_URL',
            useValue: process.env.DATABASE_URL || 'localhost:5432'
        },
        {
            provide: 'DATABASE_OPTIONS',
            useFactory: () => ({ 
                ssl: process.env.NODE_ENV === 'production',
                pool: { min: 2, max: 10 }
            })
        }
    ]
})
export class DatabaseModule {}
```

### Factory Providers

```typescript
@Injectable()
export class LoggerService {
    log(message: string) {
        console.log(`[${new Date().toISOString()}] ${message}`);
    }
}

@Module({
    providers: [
        {
            provide: 'CUSTOM_LOGGER',
            useFactory: (config: ConfigService) => {
                return config.getConfig().development 
                    ? new ConsoleLogger() 
                    : new FileLogger();
            },
            inject: [ConfigService]
        }
    ]
})
export class LoggerModule {}
```

### Creating Custom Providers

HDRA.js supports multiple ways to create and register providers:

#### 1. Value Providers

```typescript
// Simple value provider
@Module({
    providers: [
        {
            provide: 'API_CONFIG',
            useValue: {
                baseUrl: 'https://api.example.com',
                timeout: 5000,
                retries: 3
            }
        },
        {
            provide: 'DATABASE_URL',
            useValue: process.env.DATABASE_URL || 'localhost:5432'
        }
    ]
})
export class ConfigModule {}

// Usage in service
@Injectable()
export class ApiService {
    constructor(
        @Inject('API_CONFIG') private config: any,
        @Inject('DATABASE_URL') private dbUrl: string
    ) {}
}
```

#### 2. Class Providers

```typescript
// Interface for abstraction
export interface IEmailService {
    sendEmail(to: string, subject: string, body: string): Promise<void>;
}

// Implementation classes
@Injectable()
export class SmtpEmailService implements IEmailService {
    async sendEmail(to: string, subject: string, body: string) {
        console.log(`Sending SMTP email to ${to}: ${subject}`);
        // SMTP implementation
    }
}

@Injectable()
export class SendGridEmailService implements IEmailService {
    constructor(@Inject('SENDGRID_API_KEY') private apiKey: string) {}
    
    async sendEmail(to: string, subject: string, body: string) {
        console.log(`Sending SendGrid email to ${to}: ${subject}`);
        // SendGrid implementation
    }
}

// Provider registration with class switching
@Module({
    providers: [
        {
            provide: 'SENDGRID_API_KEY',
            useValue: process.env.SENDGRID_API_KEY
        },
        {
            provide: 'IEmailService',
            useClass: process.env.EMAIL_PROVIDER === 'sendgrid' 
                ? SendGridEmailService 
                : SmtpEmailService
        }
    ]
})
export class EmailModule {}

// Usage
@Injectable()
export class NotificationService {
    constructor(
        @Inject('IEmailService') private emailService: IEmailService
    ) {}
    
    async sendWelcomeEmail(userEmail: string) {
        await this.emailService.sendEmail(
            userEmail, 
            'Welcome!', 
            'Welcome to our platform!'
        );
    }
}
```

#### 3. Factory Providers with Complex Logic

```typescript
// Advanced factory provider with conditional logic
@Injectable()
export class DatabaseConnectionFactory {
    static create(config: ConfigService, logger: LoggerService) {
        const dbConfig = config.getConfig().database;
        
        if (dbConfig.type === 'mongodb') {
            return new MongoConnection({
                url: dbConfig.url,
                options: {
                    useNewUrlParser: true,
                    useUnifiedTopology: true,
                    maxPoolSize: dbConfig.poolSize || 10
                }
            });
        } else if (dbConfig.type === 'postgresql') {
            return new PostgreSQLConnection({
                host: dbConfig.host,
                port: dbConfig.port,
                database: dbConfig.database,
                username: dbConfig.username,
                password: dbConfig.password,
                pool: {
                    min: 2,
                    max: dbConfig.poolSize || 10
                }
            });
        } else {
            logger.warn('Unknown database type, using in-memory database');
            return new InMemoryConnection();
        }
    }
}

@Module({
    providers: [
        ConfigService,
        LoggerService,
        {
            provide: 'DATABASE_CONNECTION',
            useFactory: DatabaseConnectionFactory.create,
            inject: [ConfigService, LoggerService]
        }
    ]
})
export class DatabaseModule {}
```

#### 4. Async Factory Providers

```typescript
// Async provider for services that need initialization
@Injectable()
export class RedisConnectionFactory {
    static async createAsync(config: ConfigService): Promise<RedisConnection> {
        const redisConfig = config.getConfig().redis;
        
        const connection = new RedisConnection({
            host: redisConfig.host,
            port: redisConfig.port,
            password: redisConfig.password,
            db: redisConfig.database || 0
        });
        
        // Wait for connection to be established
        await connection.connect();
        
        // Perform any initialization
        await connection.ping();
        
        return connection;
    }
}

@Module({
    providers: [
        ConfigService,
        {
            provide: 'REDIS_CONNECTION',
            useFactory: RedisConnectionFactory.createAsync,
            inject: [ConfigService]
        }
    ]
})
export class CacheModule {}

// Usage with async injection
@Injectable()
export class CacheService {
    constructor(
        @Inject('REDIS_CONNECTION') private redis: RedisConnection
    ) {}
    
    async get(key: string): Promise<string | null> {
        return await this.redis.get(key);
    }
    
    async set(key: string, value: string, ttl?: number): Promise<void> {
        if (ttl) {
            await this.redis.setex(key, ttl, value);
        } else {
            await this.redis.set(key, value);
        }
    }
}
```

#### 5. Multi-Provider Pattern

```typescript
// Token for collecting multiple providers
export const VALIDATION_RULES = 'VALIDATION_RULES';

// Individual validation rule providers
@Injectable()
export class EmailValidationRule {
    validate(value: string): boolean {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
    }
    
    getType(): string {
        return 'email';
    }
}

@Injectable()
export class PhoneValidationRule {
    validate(value: string): boolean {
        return /^\+?[\d\s-()]+$/.test(value);
    }
    
    getType(): string {
        return 'phone';
    }
}

@Injectable()
export class PasswordValidationRule {
    validate(value: string): boolean {
        return value.length >= 8 && /[A-Z]/.test(value) && /[0-9]/.test(value);
    }
    
    getType(): string {
        return 'password';
    }
}

// Module with multi-provider
@Module({
    providers: [
        EmailValidationRule,
        PhoneValidationRule,
        PasswordValidationRule,
        {
            provide: VALIDATION_RULES,
            useFactory: (...rules: any[]) => rules,
            inject: [EmailValidationRule, PhoneValidationRule, PasswordValidationRule]
        }
    ]
})
export class ValidationModule {}

// Usage
@Injectable()
export class ValidationService {
    constructor(
        @Inject(VALIDATION_RULES) private rules: any[]
    ) {}
    
    validateField(type: string, value: string): boolean {
        const rule = this.rules.find(r => r.getType() === type);
        return rule ? rule.validate(value) : true;
    }
}
```

#### 6. Conditional Providers

```typescript
// Environment-based provider registration
@Module({
    providers: [
        // Always available
        ConfigService,
        LoggerService,
        
        // Conditional providers based on environment
        ...(process.env.NODE_ENV === 'production' 
            ? [
                {
                    provide: 'METRICS_SERVICE',
                    useClass: PrometheusMetricsService
                },
                {
                    provide: 'CACHE_SERVICE',
                    useClass: RedisCache
                }
            ] 
            : [
                {
                    provide: 'METRICS_SERVICE',
                    useClass: ConsoleMetricsService
                },
                {
                    provide: 'CACHE_SERVICE',
                    useClass: InMemoryCache
                }
            ]
        ),
        
        // Feature flag based providers
        ...(process.env.FEATURE_NEW_AUTH === 'true' 
            ? [{
                provide: 'AUTH_SERVICE',
                useClass: NewAuthService
            }] 
            : [{
                provide: 'AUTH_SERVICE',
                useClass: LegacyAuthService
            }]
        )
    ]
})
export class AppModule {}
```

## 🔒 Middleware System

HDRA.js provides a flexible middleware system with built-in middleware and custom middleware support.

### Built-in Middleware

```typescript
import { 
    UseMiddleware, 
    LoggerMiddleware, 
    RateLimitMiddleware,
    CorsMiddleware 
} from 'hdrajs';

@Controller('/api')
@UseMiddleware(
    LoggerMiddleware.create({
        format: 'combined',
        colorize: true
    }),
    RateLimitMiddleware.create({ 
        max: 100, 
        windowMs: 15 * 60 * 1000,
        message: 'Too many requests'
    }),
    CorsMiddleware.create({
        origin: ['http://localhost:3000', 'https://myapp.com'],
        credentials: true
    })
)
export class ApiController {
    // Your routes here
}
```

### Custom Middleware

```typescript
import { Request, Response, NextFunction } from 'express';

function authMiddleware(req: Request, res: Response, next: NextFunction) {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
        return res.status(401).json({ message: 'No token provided' });
    }
    
    try {
        // Verify JWT token
        const decoded = jwt.verify(token, process.env.JWT_SECRET!);
        req.user = decoded;
        next();
    } catch (error) {
        res.status(401).json({ message: 'Invalid token' });
    }
}

@Controller('/protected')
@UseMiddleware(authMiddleware)
export class ProtectedController {
    @Get('/profile')
    getProfile(@Req() req: Request) {
        return { user: req.user };
    }
}
```

## 🔄 Interceptors

Interceptors provide a powerful way to handle cross-cutting concerns like logging, caching, and request/response transformation.

### Built-in Interceptors

```typescript
import { 
    UseInterceptors, 
    LoggingInterceptor, 
    CacheInterceptor,
    TimeoutInterceptor 
} from 'hdrajs';

@Controller('/products')
@UseInterceptors(LoggingInterceptor)
export class ProductController {
    
    @Get('/')
    @UseInterceptors(
        new CacheInterceptor(60000), // Cache for 1 minute
        new TimeoutInterceptor(5000)  // 5 second timeout
    )
    async getAllProducts() {
        return await this.productService.findAll();
    }
    
    @Get('/:id')
    @UseInterceptors(new CacheInterceptor(300000)) // Cache for 5 minutes
    async getProduct(@Param('id') id: string) {
        return await this.productService.findById(id);
    }
}
```

### Custom Interceptors

```typescript
import { Interceptor, ExecutionContext } from 'hdrajs';

export class TransformResponseInterceptor implements Interceptor {
    async intercept(context: ExecutionContext, next: () => Promise<any>) {
        const startTime = Date.now();
        
        try {
            const result = await next();
            const responseTime = Date.now() - startTime;
            
            return {
                success: true,
                data: result,
                meta: {
                    responseTime: `${responseTime}ms`,
                    timestamp: new Date().toISOString()
                }
            };
        } catch (error) {
            const responseTime = Date.now() - startTime;
            
            return {
                success: false,
                error: error.message,
                meta: {
                    responseTime: `${responseTime}ms`,
                    timestamp: new Date().toISOString()
                }
            };
        }
    }
}

@Controller('/api')
@UseInterceptors(TransformResponseInterceptor)
export class ApiController {
    // All responses will be transformed
}
```

## 🛡️ Guards

Guards control access to routes based on various conditions like authentication, authorization, or business logic.

### Basic Guards

```typescript
import { UseGuards, Request, Response, NextFunction } from 'hdrajs';

function authGuard(req: Request, res: Response, next: NextFunction) {
    const token = req.headers.authorization;
    if (!token) {
        return res.status(401).json({ message: 'Unauthorized' });
    }
    // Verify token logic
    next();
}

function adminGuard(req: Request, res: Response, next: NextFunction) {
    if (!req.user?.isAdmin) {
        return res.status(403).json({ message: 'Admin access required' });
    }
    next();
}

@Controller('/admin')
@UseGuards(authGuard, adminGuard)
export class AdminController {
    @Get('/users')
    getAllUsers() {
        return this.userService.findAll();
    }
}
```

### Role-based Guards

```typescript
import { Injectable } from 'hdrajs';

export enum Role {
    USER = 'user',
    ADMIN = 'admin',
    MODERATOR = 'moderator'
}

@Injectable()
export class RoleGuard {
    constructor(private requiredRoles: Role[]) {}
    
    canActivate(req: Request, res: Response, next: NextFunction) {
        const userRoles = req.user?.roles || [];
        const hasRole = this.requiredRoles.some(role => userRoles.includes(role));
        
        if (!hasRole) {
            return res.status(403).json({ 
                message: 'Insufficient permissions' 
            });
        }
        
        next();
    }
}

// Usage
@Controller('/moderator')
@UseGuards(new RoleGuard([Role.ADMIN, Role.MODERATOR]))
export class ModeratorController {
    // Only admins and moderators can access
}
```

## 🛠️ CLI Tools

HDRA.js includes a powerful CLI for rapid development and code generation:

```bash
# Generate a complete feature module
npx hdra generate:module user --with-controller --with-service

# Generate individual components
npx hdra generate:controller user
npx hdra generate:service user
npx hdra generate:guard auth
npx hdra generate:middleware logger
npx hdra generate:interceptor transform

# Generate with custom options
npx hdra generate:controller product --path=src/products --crud
npx hdra generate:service email --singleton
```

### Generated Code Examples

#### Controller Generation
```bash
npx hdra generate:controller product --crud
```

Generates:
```typescript
import { Controller, Get, Post, Put, Delete, Body, Param } from 'hdrajs';
import { ProductService } from './product.service';

@Controller('/products')
export class ProductController {
    constructor(private productService: ProductService) {}

    @Get('/')
    async findAll() {
        return await this.productService.findAll();
    }

    @Get('/:id')
    async findOne(@Param('id') id: string) {
        return await this.productService.findOne(id);
    }

    @Post('/')
    async create(@Body() createDto: any) {
        return await this.productService.create(createDto);
    }

    @Put('/:id')
    async update(@Param('id') id: string, @Body() updateDto: any) {
        return await this.productService.update(id, updateDto);
    }

    @Delete('/:id')
    async remove(@Param('id') id: string) {
        return await this.productService.remove(id);
    }
}
```

## ⚙️ Configuration

HDRA.js supports comprehensive configuration for all framework features:

```typescript
import { createApp } from 'hdrajs';
import { AppModule } from './app.module';

const app = createApp(AppModule, {
    // Server configuration
    port: process.env.PORT || 3000,
    globalPrefix: '/api/v1',
    
    // CORS configuration
    cors: {
        origin: process.env.NODE_ENV === 'production' 
            ? ['https://myapp.com'] 
            : true,
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
        allowedHeaders: ['Content-Type', 'Authorization']
    },
    
    // Swagger/OpenAPI documentation
    swagger: {
        document: {
            openapi: '3.0.0',
            info: {
                title: 'My API',
                version: '1.0.0',
                description: 'API documentation with HDRA.js'
            }
        },
        path: '/docs',
        uiOptions: {
            explorer: true,
            swaggerOptions: {
                persistAuthorization: true
            }
        }
    },
    
    // Global middleware
    middleware: [
        LoggerMiddleware.create({
            format: process.env.NODE_ENV === 'production' ? 'combined' : 'dev'
        }),
        RateLimitMiddleware.create({
            max: 1000,
            windowMs: 15 * 60 * 1000, // 15 minutes
            message: 'Too many requests from this IP'
        })
    ],
    
    // Global validation pipes
    globalPipes: [
        new ValidationPipe({
            whitelist: true,
            forbidNonWhitelisted: true,
            transform: true
        })
    ],
    
    // Body parser configuration
    bodyParser: {
        json: { limit: '10mb' },
        urlencoded: { extended: true, limit: '10mb' }
    },
    
    // Static assets
    staticAssets: [
        {
            path: '/uploads',
            options: {
                root: './public/uploads',
                maxAge: '1d'
            }
        }
    ],
    
    // Error handling
    globalExceptionFilter: new GlobalExceptionFilter(),
    
    // Performance settings
    compression: true,
    helmet: {
        contentSecurityPolicy: {
            directives: {
                defaultSrc: ["'self'"],
                styleSrc: ["'self'", "'unsafe-inline'"]
            }
        }
    }
});

app.listen(3000, () => {
    console.log('🚀 Server running on http://localhost:3000');
    console.log('📚 API Docs: http://localhost:3000/docs');
});
```

## ✅ Validation System

HDRA.js provides a comprehensive validation system with built-in decorators and custom validation support.

### Built-in Validation Decorators

```typescript
import { 
    ValidateRequired,
    ValidateString,
    ValidateNumber,
    ValidateEmail,
    ValidateMinLength,
    ValidateMaxLength,
    ValidateMin,
    ValidateMax,
    ValidateIsIn,
    ValidateDate,
    ValidateArray,
    ValidateBoolean,
    ValidateUrl
} from 'hdrajs';

export class CreateUserDto {
    @ValidateRequired()
    @ValidateString()
    @ValidateMinLength(2)
    @ValidateMaxLength(50)
    firstName!: string;

    @ValidateRequired()
    @ValidateString()
    @ValidateMinLength(2)
    @ValidateMaxLength(50)
    lastName!: string;

    @ValidateRequired()
    @ValidateEmail()
    email!: string;

    @ValidateRequired()
    @ValidateNumber()
    @ValidateMin(18)
    @ValidateMax(120)
    age!: number;

    @ValidateString()
    @ValidateIsIn(['admin', 'user', 'moderator'])
    role?: string;

    @ValidateArray()
    @ValidateString({ each: true })
    interests?: string[];

    @ValidateBoolean()
    isActive?: boolean;

    @ValidateUrl()
    website?: string;

    @ValidateDate()
    birthDate?: Date;
}

export class UpdateProductDto {
    @ValidateString()
    @ValidateMinLength(3)
    @ValidateMaxLength(100)
    name?: string;

    @ValidateNumber()
    @ValidateMin(0)
    price?: number;

    @ValidateString()
    @ValidateIsIn(['electronics', 'clothing', 'books', 'home'])
    category?: string;
}
```

### Custom Validation

```typescript
import { ValidationPipe, createCustomValidator } from 'hdrajs';

// Custom validator function
const IsStrongPassword = createCustomValidator({
    name: 'isStrongPassword',
    validator: (value: string) => {
        const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
        return strongPasswordRegex.test(value);
    },
    message: 'Password must be at least 8 characters with uppercase, lowercase, number and special character'
});

export class ChangePasswordDto {
    @ValidateRequired()
    @IsStrongPassword()
    newPassword!: string;

    @ValidateRequired()
    @ValidateString()
    currentPassword!: string;
}
```

### Using Validation in Controllers

```typescript
import { Controller, Post, Body, UsePipes, ValidationPipe } from 'hdrajs';

@Controller('/users')
export class UserController {
    
    @Post('/')
    @UsePipes(ValidationPipe) // Apply validation to this endpoint
    async createUser(@Body() createUserDto: CreateUserDto) {
        return await this.userService.create(createUserDto);
    }
    
    @Post('/change-password')
    @UsePipes(new ValidationPipe({ 
        whitelist: true,           // Remove non-validated properties
        forbidNonWhitelisted: true, // Throw error for unknown properties
        transform: true            // Transform string numbers to actual numbers
    }))
    async changePassword(@Body() changePasswordDto: ChangePasswordDto) {
        return await this.userService.changePassword(changePasswordDto);
    }
}
```

## 🚀 Performance & Best Practices

### Performance Features

HDRA.js is built for high performance with several optimization features:

- **Request-scoped DI** - Memory efficient dependency injection
- **Built-in caching** - Interceptor-based response caching
- **Connection pooling** - Database connection optimization
- **Async/await optimization** - Non-blocking request handling
- **Static asset caching** - Efficient static file serving
- **Compression** - Automatic response compression
- **Memory management** - Automatic garbage collection optimization

### Best Practices

```typescript
// 1. Use request-scoped services for user-specific data
@Injectable({ scope: Scope.REQUEST })
export class UserContextService {
    private user: User | null = null;
    
    setUser(user: User) { this.user = user; }
    getUser() { return this.user; }
}

// 2. Implement caching for expensive operations
@Controller('/reports')
export class ReportController {
    
    @Get('/monthly')
    @UseInterceptors(new CacheInterceptor(3600000)) // Cache for 1 hour
    async getMonthlyReport() {
        return await this.reportService.generateMonthlyReport();
    }
}

// 3. Use validation pipes to prevent invalid data
@Post('/users')
@UsePipes(ValidationPipe)
async createUser(@Body() createUserDto: CreateUserDto) {
    return await this.userService.create(createUserDto);
}

// 4. Implement proper error handling
@Injectable()
export class UserService {
    async findById(id: string): Promise<User> {
        try {
            const user = await this.userRepository.findById(id);
            if (!user) {
                throw new HttpException('User not found', 404);
            }
            return user;
        } catch (error) {
            this.logger.error(`Error finding user ${id}:`, error);
            throw error;
        }
    }
}

// 5. Use guards for authentication and authorization
@Controller('/admin')
@UseGuards(AuthGuard, AdminGuard)
export class AdminController {
    // All routes are protected by auth and admin guards
}
```

## 🔄 Migration Guide

### From Express.js

```typescript
// Before (Express.js)
const express = require('express');
const app = express();

app.get('/users', (req, res) => {
    res.json({ users: [] });
});

app.listen(3000);

// After (HDRA.js)
import { Controller, Get, Module, createApp } from 'hdrajs';

@Controller('/users')
export class UserController {
    @Get('/')
    getUsers() {
        return { users: [] };
    }
}

@Module({
    controllers: [UserController]
})
export class AppModule {}

const app = createApp(AppModule);
app.listen(3000);
```

### From Existing HDRA.js v1

All existing v1 code is fully compatible! Simply update your dependencies and optionally adopt new features:

```typescript
// Your existing code works unchanged
@Controller('/api')
export class ApiController {
    @Get('/hello')
    hello() {
        return { message: 'Hello World' };
    }
}

// Optionally add new features
@Controller('/api')
@UseMiddleware(LoggerMiddleware.create()) // New!
@UseInterceptors(TransformResponseInterceptor) // New!
export class ApiController {
    constructor(private myService: MyService) {} // Enhanced DI!
    
    @Get('/hello')
    @UsePipes(ValidationPipe) // New validation!
    hello(@Body() dto: HelloDto) {
        return { message: 'Hello World' };
    }
}
```

## 🧪 Testing

HDRA.js provides excellent testing support:

```typescript
import { Test } from 'hdrajs/testing';
import { UserController } from './user.controller';
import { UserService } from './user.service';

describe('UserController', () => {
    let controller: UserController;
    let service: UserService;

    beforeEach(async () => {
        const module = await Test.createTestingModule({
            controllers: [UserController],
            providers: [
                {
                    provide: UserService,
                    useValue: {
                        findAll: jest.fn().mockResolvedValue([]),
                        create: jest.fn()
                    }
                }
            ]
        }).compile();

        controller = module.get<UserController>(UserController);
        service = module.get<UserService>(UserService);
    });

    it('should return an array of users', async () => {
        const result = await controller.findAll();
        expect(result).toEqual([]);
        expect(service.findAll).toHaveBeenCalled();
    });
});
```

## 📚 Complete Examples

### E-commerce API Example

```typescript
// Product entity
export interface Product {
    id: string;
    name: string;
    price: number;
    category: string;
    description: string;
    inStock: boolean;
}

// DTOs
export class CreateProductDto {
    @ValidateRequired()
    @ValidateString()
    @ValidateMinLength(2)
    name!: string;

    @ValidateRequired()
    @ValidateNumber()
    @ValidateMin(0)
    price!: number;

    @ValidateRequired()
    @ValidateString()
    @ValidateIsIn(['electronics', 'clothing', 'books', 'home'])
    category!: string;

    @ValidateString()
    description?: string;
}

// Service with DI
@Injectable()
export class ProductService {
    constructor(
        @Inject('PRODUCT_REPOSITORY') private productRepo: ProductRepository,
        private logger: LoggerService,
        private cacheService: CacheService
    ) {}

    async findAll(filters?: any): Promise<Product[]> {
        const cacheKey = `products:${JSON.stringify(filters)}`;
        
        let products = await this.cacheService.get(cacheKey);
        if (!products) {
            products = await this.productRepo.findAll(filters);
            await this.cacheService.set(cacheKey, products, 300); // 5 min cache
        }
        
        return products;
    }

    async create(productData: CreateProductDto): Promise<Product> {
        const product = await this.productRepo.create({
            ...productData,
            id: generateId(),
            inStock: true
        });
        
        this.logger.log(`Product created: ${product.id}`);
        await this.cacheService.invalidatePattern('products:*');
        
        return product;
    }
}

// Controller with full features
@Controller('/products')
@ApiTags('Products')
@UseMiddleware(LoggerMiddleware.create())
@UseInterceptors(TransformResponseInterceptor)
export class ProductController {
    constructor(private productService: ProductService) {}

    @Get('/')
    @ApiOperation({ summary: 'Get all products' })
    @UseInterceptors(new CacheInterceptor(60000)) // 1 min cache
    async findAll(@Query() filters: any) {
        return await this.productService.findAll(filters);
    }

    @Get('/:id')
    @ApiOperation({ summary: 'Get product by ID' })
    @UseInterceptors(new CacheInterceptor(300000)) // 5 min cache
    async findOne(@Param('id') id: string) {
        return await this.productService.findById(id);
    }

    @Post('/')
    @ApiOperation({ summary: 'Create new product' })
    @UseGuards(AuthGuard, AdminGuard)
    @UsePipes(ValidationPipe)
    async create(@Body() createProductDto: CreateProductDto) {
        return await this.productService.create(createProductDto);
    }

    @Put('/:id')
    @ApiOperation({ summary: 'Update product' })
    @UseGuards(AuthGuard, AdminGuard)
    @UsePipes(ValidationPipe)
    async update(
        @Param('id') id: string, 
        @Body() updateProductDto: Partial<CreateProductDto>
    ) {
        return await this.productService.update(id, updateProductDto);
    }

    @Delete('/:id')
    @ApiOperation({ summary: 'Delete product' })
    @UseGuards(AuthGuard, AdminGuard)
    async remove(@Param('id') id: string) {
        return await this.productService.remove(id);
    }
}

// Module configuration
@Module({
    controllers: [ProductController],
    providers: [
        ProductService,
        LoggerService,
        CacheService,
        {
            provide: 'PRODUCT_REPOSITORY',
            useClass: MongoProductRepository
        }
    ],
    exports: [ProductService]
})
export class ProductModule {}

// Main app setup
const app = createApp(AppModule, {
    globalPrefix: '/api/v1',
    cors: { origin: true, credentials: true },
    swagger: {
        document: {
            openapi: '3.0.0',
            info: {
                title: 'E-commerce API',
                version: '1.0.0'
            }
        },
        path: '/docs'
    },
    middleware: [
        LoggerMiddleware.create(),
        RateLimitMiddleware.create({ max: 1000, windowMs: 900000 })
    ]
});

app.listen(3000, () => {
    console.log('🛒 E-commerce API running on http://localhost:3000');
    console.log('📚 API Documentation: http://localhost:3000/docs');
});
```

## 🤝 Contributing

We welcome contributions! Here's how to get started:

### Development Setup

```bash
# Clone the repository
git clone https://github.com/Hoanle396/hdrajs.git
cd hdrajs

# Install dependencies
bun install

# Run tests
bun test

# Build the project
bun run build

# Run examples
cd examples
bun run dev
```

### Contributing Guidelines

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Commit** your changes (`git commit -m 'Add amazing feature'`)
4. **Push** to the branch (`git push origin feature/amazing-feature`)
5. **Open** a Pull Request

### Code Style

- Use TypeScript for all code
- Follow existing code style and conventions
- Add tests for new features
- Update documentation for API changes
- Use conventional commits

### Reporting Issues

When reporting issues, please include:

- Node.js and Bun versions
- HDRA.js version
- Minimal reproduction example
- Expected vs actual behavior
- Error logs if applicable

## 📄 License

MIT License © 2025 [Hoanle396](https://github.com/Hoanle396)

## 🔗 Links & Support

- 📚 **Documentation**: [GitHub Repository](https://github.com/Hoanle396/hdrajs)
- 🐛 **Issues**: [Report Issues](https://github.com/Hoanle396/hdrajs/issues)
- 💬 **Discussions**: [Community Discussions](https://github.com/Hoanle396/hdrajs/discussions)
- 📦 **NPM Package**: [hdrajs on NPM](https://www.npmjs.com/package/hdrajs)

### Community

- ⭐ **Star** the repository if you find it useful
- 🐦 **Follow** [@Hoanle396](https://twitter.com/Hoanle396) for updates
- 💡 **Share** your projects built with HDRA.js

---

**Built with ❤️ by the HDRA.js community**

*HDRA.js v1.0 Enhanced Edition - Powerful TypeScript framework for modern Node.js applications*
