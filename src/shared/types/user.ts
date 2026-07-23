import { USER_ROLES } from '../constants/user-roles';
import { UpdateUserInfoSchemaInput } from '../contracts/user/user.schema';

export type UserRole = (typeof USER_ROLES)[keyof typeof USER_ROLES];

export type User = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  isActive: boolean;
};

export interface UpdateUserPayload {
  id: string;
  data: UpdateUserInfoSchemaInput;
}

export interface DeleteUserPayload {
  id: string;
}

export interface GetUserPayload {
  id: string;
}
