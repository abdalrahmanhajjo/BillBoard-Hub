import { getAuthShowcaseBoards } from '@/server/modules/billboards/actions/get-auth-showcase-boards.action';
import { ResetPasswordFeaturePage } from '@/client/features/auth/pages/reset-password-page';

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string | string[] }>;
}) {
  const [{ token }, boards] = await Promise.all([searchParams, getAuthShowcaseBoards()]);

  return (
    <ResetPasswordFeaturePage token={typeof token === 'string' ? token : ''} boards={boards} />
  );
}
