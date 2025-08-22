import { Injectable, NotFoundException } from '../../..';

export interface User {
    id: number;
    name: string;
    email: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface CreateUserData {
    name: string;
    email: string;
    password?: string;
}

export interface UpdateUserData {
    name?: string;
    email?: string;
}

export interface FindAllOptions {
    page: number;
    limit: number;
    search?: string;
}

export interface PaginatedResult<T> {
    data: T[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        pages: number;
    };
}

@Injectable()
export class UserService {
    private users: User[] = [
        {
            id: 1,
            name: 'John Doe',
            email: 'john@example.com',
            createdAt: new Date('2023-01-01'),
            updatedAt: new Date('2023-01-01')
        },
        {
            id: 2,
            name: 'Jane Smith',
            email: 'jane@example.com',
            createdAt: new Date('2023-01-02'),
            updatedAt: new Date('2023-01-02')
        },
        {
            id: 3,
            name: 'Bob Johnson',
            email: 'bob@example.com',
            createdAt: new Date('2023-01-03'),
            updatedAt: new Date('2023-01-03')
        }
    ];
    private nextId = 4;

    findAll(options: FindAllOptions): PaginatedResult<User> {
        let filteredUsers = this.users;

        // Apply search filter
        if (options.search) {
            const searchLower = options.search.toLowerCase();
            filteredUsers = this.users.filter(user => 
                user.name.toLowerCase().includes(searchLower) ||
                user.email.toLowerCase().includes(searchLower)
            );
        }

        // Calculate pagination
        const total = filteredUsers.length;
        const pages = Math.ceil(total / options.limit);
        const startIndex = (options.page - 1) * options.limit;
        const endIndex = startIndex + options.limit;

        const data = filteredUsers.slice(startIndex, endIndex);

        return {
            data,
            pagination: {
                page: options.page,
                limit: options.limit,
                total,
                pages
            }
        };
    }

    findById(id: number): User {
        const user = this.users.find(u => u.id === id);
        if (!user) {
            throw new NotFoundException(`User with ID ${id} not found`);
        }
        return user;
    }

    create(createUserData: CreateUserData): User {
        const existingUser = this.users.find(u => u.email === createUserData.email);
        if (existingUser) {
            throw new Error('User with this email already exists');
        }

        const newUser: User = {
            id: this.nextId++,
            name: createUserData.name,
            email: createUserData.email,
            createdAt: new Date(),
            updatedAt: new Date()
        };

        this.users.push(newUser);
        return newUser;
    }

    update(id: number, updateUserData: UpdateUserData): User {
        const userIndex = this.users.findIndex(u => u.id === id);
        if (userIndex === -1) {
            throw new NotFoundException(`User with ID ${id} not found`);
        }

        // Check for email conflicts
        if (updateUserData.email) {
            const existingUser = this.users.find(u => u.email === updateUserData.email && u.id !== id);
            if (existingUser) {
                throw new Error('User with this email already exists');
            }
        }

        const updatedUser = {
            ...this.users[userIndex],
            ...updateUserData,
            updatedAt: new Date()
        };

        this.users[userIndex] = updatedUser;
        return updatedUser;
    }

    remove(id: number): void {
        const userIndex = this.users.findIndex(u => u.id === id);
        if (userIndex === -1) {
            throw new NotFoundException(`User with ID ${id} not found`);
        }

        this.users.splice(userIndex, 1);
    }

    // Additional utility methods
    count(): number {
        return this.users.length;
    }

    existsByEmail(email: string): boolean {
        return this.users.some(u => u.email === email);
    }

    findByEmail(email: string): User | undefined {
        return this.users.find(u => u.email === email);
    }
}
