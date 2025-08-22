import {
    ApiOperation,
    ApiResponse,
    ApiTags,
    Body,
    CacheInterceptor,
    Controller,
    Delete,
    Get,
    LoggingInterceptor,
    Param,
    Post,
    Put,
    Query,
    UseGuards,
    UseInterceptors,
    UsePipes,
    ValidateEmail,
    ValidateMinLength,
    ValidateRequired,
    ValidateString,
    ValidationPipe
} from '../../..';
import { authGuard } from '../guard/auth.guard';
import { UserService } from './user.service';

export class CreateUserDto {
    @ValidateRequired()
    @ValidateString()
    @ValidateMinLength(2)
    name!: string;

    @ValidateRequired()
    @ValidateEmail()
    email!: string;

    @ValidateString()
    @ValidateMinLength(6)
    password?: string;
}

export class UpdateUserDto {
    @ValidateString()
    @ValidateMinLength(2)
    name?: string;

    @ValidateEmail()
    email?: string;
}

export class UserResponseDto {
    id!: number;
    name!: string;
    email!: string;
    createdAt!: Date;
    updatedAt!: Date;
}

@Controller('/users')
@ApiTags('Users')
@UseInterceptors(LoggingInterceptor)
export class UserController {
    constructor(private userService: UserService) { }

    @Get('/')
    @UseInterceptors(CacheInterceptor)
    @ApiOperation({
        summary: 'Get all users',
        description: 'Retrieve a paginated list of all users with optional filtering',
    })
    @ApiResponse(200, {
        description: 'List of users retrieved successfully',
        schema: {
            type: 'object',
            properties: {
                data: {
                    type: 'array',
                    items: {
                        type: 'object',
                        properties: {
                            id: { type: 'number' },
                            name: { type: 'string' },
                            email: { type: 'string' },
                            createdAt: { type: 'string', format: 'date-time' },
                            updatedAt: { type: 'string', format: 'date-time' }
                        }
                    }
                },
                pagination: {
                    type: 'object',
                    properties: {
                        page: { type: 'number' },
                        limit: { type: 'number' },
                        total: { type: 'number' }
                    }
                }
            }
        }
    })
    async getAll(
        @Query('page') page: string = '1',
        @Query('limit') limit: string = '10',
        @Query('search') search?: string
    ) {
        return this.userService.findAll({
            page: parseInt(page),
            limit: parseInt(limit),
            search
        });
    }

    @Get('/:id')
    @UseInterceptors(CacheInterceptor)
    @ApiOperation({
        summary: 'Get user by ID',
        description: 'Retrieve a single user by their ID',
    })
    @ApiResponse(200, {
        description: 'User found successfully',
        schema: {
            type: 'object',
            properties: {
                id: { type: 'number' },
                name: { type: 'string' },
                email: { type: 'string' },
                createdAt: { type: 'string', format: 'date-time' },
                updatedAt: { type: 'string', format: 'date-time' }
            }
        }
    })
    @ApiResponse(404, {
        description: 'User not found'
    })
    async getUser(@Param('id') id: string) {
        return this.userService.findById(parseInt(id));
    }

    @Post('/')
    @UsePipes(ValidationPipe)
    @ApiOperation({
        summary: 'Create new user',
        description: 'Create a new user with validation',
        security: [
            {
                bearerAuth: []
            }
        ]
    })
    @ApiResponse(201, {
        description: 'User created successfully',
        schema: {
            type: 'object',
            properties: {
                id: { type: 'number' },
                name: { type: 'string' },
                email: { type: 'string' },
                createdAt: { type: 'string', format: 'date-time' }
            }
        }
    })
    @ApiResponse(400, {
        description: 'Validation failed'
    })
    @UseGuards(authGuard)
    async createUser(@Body() createUserDto: CreateUserDto) {
        return this.userService.create(createUserDto);
    }

    @Put('/:id')
    @UsePipes(ValidationPipe)
    @ApiOperation({
        summary: 'Update user',
        description: 'Update an existing user with validation',
        security: [
            {
                bearerAuth: []
            }
        ]
    })
    @ApiResponse(200, {
        description: 'User updated successfully'
    })
    @ApiResponse(404, {
        description: 'User not found'
    })
    @UseGuards(authGuard)
    async updateUser(
        @Param('id') id: string, 
        @Body() updateUserDto: UpdateUserDto
    ) {
        return this.userService.update(parseInt(id), updateUserDto);
    }

    @Delete('/:id')
    @ApiOperation({
        summary: 'Delete user',
        description: 'Delete a user by ID',
        security: [
            {
                bearerAuth: []
            }
        ]
    })
    @ApiResponse(204, {
        description: 'User deleted successfully'
    })
    @ApiResponse(404, {
        description: 'User not found'
    })
    @UseGuards(authGuard)
    async deleteUser(@Param('id') id: string) {
        await this.userService.remove(parseInt(id));
        return; // 204 No Content
    }
}
