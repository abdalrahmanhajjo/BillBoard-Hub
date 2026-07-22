import { apiResponse } from "@/server/http/api-response";
import {
  handleControllerError,
  validationMessage,
} from "@/server/http/controller-utils";
import { NotFoundError } from "@/shared/http/http-error";
import { userService } from "@/server/modules/users/user.service";
import type {
  CreateUserSchemaInput,
  UpdateUserInfoSchemaInput,
} from "@/shared/contracts/user/user.schema";
import {
  createUserSchema,
  updateUserInfoSchema,
} from "@/shared/contracts/user/user.schema";

export const userController = {
  async createUser(payload: CreateUserSchemaInput) {
    const parsed = createUserSchema.safeParse(payload);

    if (!parsed.success) {
      return apiResponse.badRequest(
        validationMessage(parsed.error.issues, "Invalid user data."),
      );
    }

    try {
      const user = await userService.create(parsed.data);

      return apiResponse.ok(user, 201);
    } catch (error) {
      return handleControllerError(error, "User creation failed.");
    }
  },

  async updateUserInfo(userId: string, payload: UpdateUserInfoSchemaInput) {
    if (!userId) {
      return apiResponse.badRequest("User id is required.");
    }

    const parsed = updateUserInfoSchema.safeParse(payload);

    if (!parsed.success) {
      return apiResponse.badRequest(
        validationMessage(parsed.error.issues, "Invalid user data."),
      );
    }

    try {
      const user = await userService.updateById(userId, parsed.data);

      if (!user) {
        throw new NotFoundError("User not found.");
      }

      return apiResponse.ok(user);
    } catch (error) {
      return handleControllerError(error, "User update failed.");
    }
  },

  async deleteUser(userId: string) {
    if (!userId) {
      return apiResponse.badRequest("User id is required.");
    }

    try {
      const user = await userService.deleteById(userId);

      if (!user) {
        throw new NotFoundError("User not found.");
      }

      return apiResponse.ok(user);
    } catch (error) {
      return handleControllerError(error, "User deletion failed.");
    }
  },

  async getUser(id: string) {
    if (!id) {
      return apiResponse.badRequest("User id is required.");
    }

    try {
      const user = await userService.getById(id);

      if (!user) {
        throw new NotFoundError("User not found.");
      }

      return apiResponse.ok({ user });
    } catch (error) {
      return handleControllerError(error, "Getting user failed.");
    }
  },
};
