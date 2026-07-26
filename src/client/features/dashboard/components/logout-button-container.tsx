'use client';

import { useRouter } from 'next/dist/client/components/navigation';
import { useLogout } from '../../auth/hooks/use-logout';
import { Button } from '@/client/ui/components/ui/button';

export default function LogoutButtonContainer() {
  const logout = useLogout();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await logout.mutateAsync();
      router.push('/login');
      router.refresh();
      // Redirect to login page or perform any other action after successful logout
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <>
      <Button className="mt-6" variant="destructive" onClick={handleLogout}>
        {logout.isPending ? 'Logging out...' : 'Logout'}
      </Button>
      {logout.error && (
        <p className="mt-2 text-sm text-red-600">
          {logout.error.message || 'An error occurred during logout.'}
        </p>
      )}
    </>
  );
}
