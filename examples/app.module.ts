import { Module } from "..";
import { UserModule } from "./src/users/user.module";
import { UserController } from "./src/users/user.controller";
import { UserService } from "./src/users/user.service";

@Module({
    imports: [UserModule],
    controllers: [UserController],
    providers: [UserService]
})
export class AppModule { }