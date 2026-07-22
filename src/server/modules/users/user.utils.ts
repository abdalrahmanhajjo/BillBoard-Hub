import { UserDocument } from "./user.model";
import type { User } from "@/shared/types/user";

function toUser(user: UserDocument): User {
  return {
    id: String(user._id),
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    role: user.role,
    isActive: user.isActive || false,
  };
}

export { toUser };