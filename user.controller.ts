import { All, Controller, Get, Post } from './decorators';
import { Body, Param, Query } from './decorators/request.decorator';
import { UserService } from './user.service';

export class CreateUserDto {
    name!: string;
}

@Controller('/users')
export class UserController {
    constructor(private userService: UserService) { }

    @All('/')
    getAll() {
        return this.userService.findAll();
    }

    @Get('/:id')
    getUser(@Param('id') id: number, @Query() include?: CreateUserDto) {
        return this.userService.findById(Number(id));
    }

    @Post('/')
    createUser(@Body() user: CreateUserDto) {
        return this.userService.create(user);
    }
}
