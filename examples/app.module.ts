import { Module } from "../decorators";
import { UserModule } from "./src/users/user.module";

@Module({
    imports: [UserModule]
})
export class AppModule { }