import { apiResponse } from '@/server/http/api-response';
import {
  handleControllerError,
  requireSession,
  validationMessage,
} from '@/server/http/controller-utils';
import { NotFoundError } from '@/shared/http/http-error';
import { userService } from '@/server/modules/users/user.service';
import type {
  CreateUserSchemaInput,
  UpdateUserInfoSchemaInput,
} from '@/shared/contracts/user/user.schema';
import { createUserSchema, updateUserInfoSchema } from '@/shared/contracts/user/user.schema';

export const userController = {
  async createUser(payload: CreateUserSchemaInput) {
    const parsed = createUserSchema.safeParse(payload);

    if (!parsed.success) {
      return apiResponse.badRequest(validationMessage(parsed.error.issues, 'Invalid user data.'));
    }

    try {
      const session = await requireSession();
      const user = await userService.create(parsed.data, session.user);

      return apiResponse.ok(user, 201);
    } catch (error) {
      return handleControllerError(
        error,
        'We could not create this user. Review the details and try again.',
      );
    }
  },

  async updateUserInfo(userId: string, payload: UpdateUserInfoSchemaInput) {
    if (!userId) {
      return apiResponse.badRequest('User id is required.');
    }

    const parsed = updateUserInfoSchema.safeParse(payload);

    if (!parsed.success) {
      return apiResponse.badRequest(validationMessage(parsed.error.issues, 'Invalid user data.'));
    }

    try {
      const session = await requireSession();
      const user = await userService.updateById(userId, parsed.data, session.user);

      if (!user) {
        throw new NotFoundError('We could not find this user. They may have been removed.');
      }

      return apiResponse.ok(user);
    } catch (error) {
      return handleControllerError(error, 'We could not save this user. Refresh and try again.');
    }
  },

  async deleteUser(userId: string) {
    if (!userId) {
      return apiResponse.badRequest('User id is required.');
    }

    try {
      const session = await requireSession();
      const user = await userService.deleteById(userId, session.user);

      if (!user) {
        throw new NotFoundError('We could not find this user. They may have been removed.');
      }

      return apiResponse.ok(user);
    } catch (error) {
      return handleControllerError(error, 'We could not delete this user. Refresh and try again.');
    }
  },

  async getUser(id: string) {
    if (!id) {
      return apiResponse.badRequest('User id is required.');
    }

    try {
      const session = await requireSession();
      const user = await userService.getById(id, session.user);

      if (!user) {
        throw new NotFoundError('We could not find this user. They may have been removed.');
      }

      return apiResponse.ok({ user });
    } catch (error) {
      return handleControllerError(error, 'We could not load this user. Refresh and try again.');
    }
  },
};
