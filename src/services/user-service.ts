import { User } from '../types';
import { UserRole } from '../types/staff';
import { hasPermission } from '../lib/permissions';

const users: User[] = [];

export const createUser = (userData: Omit<User, 'createdAt' | 'updatedAt'>): User => {
    const now = new Date().toISOString();
    const newUser: User = {
        ...userData,
        // userId is now expected to be the Firebase Auth UID
        createdAt: now,
        updatedAt: now,
    };
    users.push(newUser);
    return newUser;
}

export const getUserById = (userId: string): User | undefined => {
    return users.find(u => u.userId === userId);
}

export const getUsers = (): User[] => {
    return users;
}

export const checkUserPermission = (userId: string, permission: string): boolean | { error: string } => {
    const user = getUserById(userId);
    if (!user) {
        return { error: 'User not found' };
    }
    return hasPermission(user.role as UserRole, permission);
}
