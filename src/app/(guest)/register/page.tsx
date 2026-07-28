import { getAuthShowcaseBoards } from '@/server/modules/billboards/actions/get-auth-showcase-boards.action';
import { RegisterFeaturePage } from '@/client/features/auth/pages/register-page';

export default async function RegisterPage() {
  const boards = await getAuthShowcaseBoards();

  return <RegisterFeaturePage boards={boards} />;
}
