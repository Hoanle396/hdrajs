import { Injectable, Controller, Get, Post, Body, Module, createApp, ValidationPipe } from '../index';

// 1. Create an Injectable Service
@Injectable()
export class UserService {
    private users = [
        { id: 1, name: 'John Doe', email: 'john@example.com' },
        { id: 2, name: 'Jane Smith', email: 'jane@example.com' }
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

    delete(id: number) {
        const index = this.users.findIndex(user => user.id === id);
        if (index > -1) {
            return this.users.splice(index, 1)[0];
        }
        return null;
    }
}

// 2. Create a Logger Service (Request Scoped)
@Injectable()
export class LoggerService {
    log(message: string) {
        console.log(`[${new Date().toISOString()}] ${message}`);
    }

    error(message: string, error?: any) {
        console.error(`[${new Date().toISOString()}] ERROR: ${message}`, error);
    }
}

// 3. Create a Controller that Injects Services
@Controller('/api/users')
export class UserController {
    // Constructor injection - Both services are automatically injected
    constructor(
        private userService: UserService,
        private loggerService: LoggerService
    ) {}

    @Get('/')
    getAll() {
        this.loggerService.log('Fetching all users');
        return {
            success: true,
            data: this.userService.findAll()
        };
    }

    @Get('/:id')
    getById(req: any) {
        const id = parseInt(req.params.id);
        this.loggerService.log(`Fetching user with ID: ${id}`);
        
        const user = this.userService.findById(id);
        if (!user) {
            return { success: false, message: 'User not found' };
        }
        
        return { success: true, data: user };
    }

    @Post('/')
    create(@Body() userData: { name: string; email: string }) {
        this.loggerService.log(`Creating new user: ${userData.name}`);
        
        const newUser = this.userService.create(userData);
        return {
            success: true,
            message: 'User created successfully',
            data: newUser
        };
    }
}

// 4. Create a Module
@Module({
    controllers: [UserController],
    providers: [UserService, LoggerService]
})
export class AppModule {}

// 5. Bootstrap the Application
const app = createApp(AppModule, {
    globalPrefix: '/api',
    globalPipes: [ValidationPipe]
});

app.listen(4001, () => {
    console.log('🚀 DI Example Server running on http://localhost:4001');
    console.log('📋 Available endpoints:');
    console.log('  GET  /api/users      - Get all users');
    console.log('  GET  /api/users/:id  - Get user by ID');
    console.log('  POST /api/users      - Create new user');
    console.log('');
    console.log('💡 Example POST request body:');
    console.log('  { "name": "New User", "email": "user@example.com" }');
});
