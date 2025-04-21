import { ApiOperation, ApiResponse, ApiTags, Body, Controller, Get, Param, Post, Query, UseGuards } from '../../../decorators';
import { authGuard } from '../guard/auth.guard';
import { UserService } from './user.service';

export class CreateUserDto {
    name!: string;
}

@Controller('/users')
@ApiTags('Users')
export class UserController {
    constructor(private userService: UserService) { }

    @Get('/')
    @ApiOperation({
        summary: 'Get all users',
        description: 'Retrieve a list of all users',
    })
    @ApiResponse(200, {
        description: 'List of users retrieved successfully',
        schema: {
            type: 'array',
            items: {
                type: 'object',
                properties: {
                    id: { type: 'number' },
                    name: { type: 'string' }
                }
            }
        }
    })
    getAll() {
        return this.userService.findAll();
    }

    @Get('/:id')
    @ApiOperation({
        summary: 'Get user by ID',
        description: 'Retrieve a single user by their ID',
        responses: {
            '200': {
                description: 'User found successfully',
                type: 'object'
            },
            '404': {
                description: 'User not found'
            }
        }
    })
    getUser(@Param('id') id: number, @Query() include?: CreateUserDto) {
        return this.userService.findById(Number(id));
    }

    @Post('/')
    @ApiOperation({
        summary: 'Create new user',
        description: 'Create a new user with the provided data',
        responses: {
            '201': {
                description: 'User created successfully',
                type: 'object',
                schema: CreateUserDto
            }
        },
        security: [
            {
                bearerAuth: []
            }
        ]
    })
    @UseGuards(authGuard)
    createUser(@Body() user: CreateUserDto) {
        return this.userService.create(user);
    }
}
