import { getAuthShowcaseBoards } from '@/server/modules/billboards/actions/get-auth-showcase-boards.action';
import { ForgotPasswordFeaturePage } from '@/client/features/auth/pages/forgot-password-page';

export default async function ForgotPasswordPage() {
  const boards = await getAuthShowcaseBoards();

  return <ForgotPasswordFeaturePage boards={boards} />;
}
