export default function AdminDashboardPage() {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-4">
      <h1 className="text-2xl font-bold">Admin Dashboard</h1>
      <p className="text-muted-foreground text-lg">
        Welcome to the admin dashboard! Here you can manage users, view analytics, and perform other
        administrative tasks.
      </p>
    </div>
  );
}
