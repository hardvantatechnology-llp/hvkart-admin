import { getAdminSession } from "@/lib/auth/session";

export default async function DashboardPage() {
  const session = await getAdminSession();

  return (
    <div>
      <h1 className="text-2xl font-bold text-white">Welcome, {session.user.name || session.user.email}</h1>
      <p className="mt-2 text-sm text-white/40">
        This is Phase 1 of the admin panel — authentication only. Products, Orders, Customers, Delivery,
        Marketing, Reports, and Settings will be migrated in later phases.
      </p>
    </div>
  );
}
