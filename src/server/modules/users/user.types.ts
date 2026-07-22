import { CreateUserSchemaInput } from '@/shared/contracts/user/user.schema';
import { UserRole } from '@/shared/types/user';

export interface UserRecord extends Omit<CreateUserSchemaInput, 'password' | 'confirmPassword'> {
  role: UserRole;
  passwordHash: string;
  isActive?: boolean;
}
