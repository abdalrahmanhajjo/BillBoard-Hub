import bcrypt from 'bcryptjs';
import { userRepository } from '@/server/modules/users/user.repository';
import { toUser } from '@/server/modules/users/user.utils';
import { USER_ROLES } from '@/shared/constants/user-roles';
import type {
  CreateUserSchemaInput,
  UpdateUserInfoSchemaInput,
} from '@/shared/contracts/user/user.schema';
import type { User, UserRole } from '@/shared/types/user';
import { ConflictError } from '@/shared/http/http-error';

type CreateUserServiceInput = Omit<CreateUserSchemaInput, 'role'>;

const configuredSaltRounds = Number.parseInt(process.env.SALT_ROUNDS ?? '12', 10);
const SALT_ROUNDS =
  Number.isInteger(configuredSaltRounds) && configuredSaltRounds >= 10 ? configuredSaltRounds : 12;

export const userService = {
  async create(input: CreateUserServiceInput, role?: UserRole): Promise<User> {
    const assignedRole = role ?? USER_ROLES.ADVERTISER;

    const existing = await userRepository.findByEmail(input.email);
    if (existing) {
      throw new ConflictError('Email is already in use.');
    }

    const passwordHash = await bcrypt.hash(input.password, SALT_ROUNDS);
    const created = await userRepository.create({
      firstName: input.firstName,
      lastName: input.lastName,
      email: input.email,
      passwordHash,
      role: assignedRole,
    });

    return toUser(created);
  },

  async findByEmailWithPassword(email: string, password: string): Promise<User | null> {
    const user = await userRepository.findByEmailWithPassword(email);
    if (!user || !user.passwordHash) {
      return null;
    }

    if (!user.isActive) {
      return null;
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      return null;
    }

    return toUser(user);
  },

  async getById(userId: string): Promise<User | null> {
    const user = await userRepository.findById(userId);
    if (!user || !user.isActive) {
      return null;
    }

    return toUser(user);
  },

  async updateById(
    userId: string,
    updateData: Partial<UpdateUserInfoSchemaInput>,
  ): Promise<User | null> {
    const updated = await userRepository.updateById(userId, updateData);
    if (!updated) {
      return null;
    }

    return toUser(updated);
  },

  async deleteById(userId: string): Promise<User | null> {
    const deleted = await userRepository.deleteById(userId);
    if (!deleted) {
      return null;
    }

    return toUser(deleted);
  },
};
