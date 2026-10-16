import { authConfigured } from "@/lib/server";
import { AdminPortal } from "@/components/admin-portal";
export const dynamic = "force-dynamic";
export default function Admin() {
  return <AdminPortal configured={authConfigured()} />;
}
