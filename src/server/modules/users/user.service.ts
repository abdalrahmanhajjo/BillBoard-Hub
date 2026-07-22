import bcrypt from "bcryptjs";
import { userRepository } from "@/server/modules/users/user.repository";
import { toUser } from "@/server/modules/users/user.utils";
import { USER_ROLES } from "@/shared/constants/user-roles";
import type { CreateUserSchemaInput, UpdateUserInfoSchemaInput } from "@/shared/contracts/user/user.schema";
<<<<<<< Updated upstream
import type { User, UserRole } from "@/shared/types/user";
=======
import type { User } from "@/shared/types/user";
>>>>>>> Stashed changes

const SALT_ROUNDS = Number(process.env.SALT_ROUNDS);

export const userService = {
  async create(
    input: CreateUserSchemaInput,
<<<<<<< Updated upstream
    role?: UserRole,
  ): Promise<User> {
    const assignedRole = role ?? USER_ROLES.ADVERTISER;
=======
  ): Promise<User> {
    const assignedRole = input.role ?? USER_ROLES.ADVERTISER;
>>>>>>> Stashed changes

    const existing = await userRepository.findByEmail(input.email);
    if (existing) {
      throw new Error("Email is already in use.");
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

  async findByEmailWithPassword(
    email: string,
    password: string,
  ): Promise<User | null> {
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
<<<<<<< Updated upstream
=======

>>>>>>> Stashed changes
    const user = await userRepository.findById(userId);
    if (!user || !user.isActive) {
      return null;
    }

    return toUser(user);
  },

  async updateById(
    userId: string,
<<<<<<< Updated upstream
    updateData: UpdateUserInfoSchemaInput,
  ): Promise<User | null> {
=======
    updateData: Partial<UpdateUserInfoSchemaInput>,
  ): Promise<User | null> {

>>>>>>> Stashed changes
    const updated = await userRepository.updateById(userId, updateData);
    if (!updated) {
      return null;
    }

    return toUser(updated);
  },

  async deleteById(
    userId: string,
  ): Promise<User | null> {
<<<<<<< Updated upstream
=======

>>>>>>> Stashed changes
    const deleted = await userRepository.deleteById(userId);
    if (!deleted) {
      return null;
    }

    return toUser(deleted);
  },  
};
