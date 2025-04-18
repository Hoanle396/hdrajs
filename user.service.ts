import { Injectable } from "./decorators";

@Injectable()
export class UserService {
    private users = [{ id: 1, name: 'Alice' }, { id: 2, name: 'Bob' }];

    findAll() {
        return this.users;
    }

    findById(id: number) {
        return this.users.find(u => u.id === id);
    }

    create(user: { name: string }) {
        const newUser = { id: this.users.length + 1, ...user };
        this.users.push(newUser);
        return newUser;
    }
}