import { Injectable, NotFoundException } from "../../../decorators";

@Injectable()
export class UserService {
    private users = [{ id: 1, name: 'Alice' }, { id: 2, name: 'Bob' }];

    findAll() {
        return this.users;
    }

    findById(id: number) {
        const user = this.users.find(u => u.id === id);
        if (!user) throw new NotFoundException('User not found');
        return user;
    }

    create(user: { name: string }) {
        const newUser = { id: this.users.length + 1, ...user };
        this.users.push(newUser);
        return newUser;
    }
}