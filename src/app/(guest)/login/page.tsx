import { getAuthShowcaseBoards } from '@/server/modules/billboards/actions/get-auth-showcase-boards.action';
import { LoginFeaturePage } from '@/client/features/auth/pages/login-page';

export default async function LoginPage() {
  const boards = await getAuthShowcaseBoards();

  return <LoginFeaturePage boards={boards} />;
}
