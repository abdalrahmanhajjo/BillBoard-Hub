import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { USER_ROLES } from "@/shared/constants/user-roles";
export default async function AdminDashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  if (session.user.role !== USER_ROLES.ADMIN) {
    redirect("/unauthorized");
  }

  return <>{children}</>;
}
