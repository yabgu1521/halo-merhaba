import { authConfigured, authorizedAdmin, privateJson } from "@/lib/server";
export async function GET(request: Request) {
  if (!authConfigured()) return privateJson({ error: "not_configured" }, 503);
  try {
    const admin = await authorizedAdmin();
    if (!admin) return privateJson({ error: "unauthorized" }, 401);
    const url = new URL(request.url),
      kind = url.searchParams.get("kind");
    let query = admin.db
      .from("halo_leads")
      .select("id,kind,name,email,whatsapp,status,created_at")
      .order("created_at", { ascending: false })
      .limit(100);
    if (kind) query = query.eq("kind", kind);
    const { data, error } = await query;
    if (error) return privateJson({ error: "unavailable" }, 503);
    const { data: counts, error: countError } =
      await admin.db.rpc("halo_lead_counts");
    if (countError) return privateJson({ error: "unavailable" }, 503);
    return privateJson({ leads: data || [], counts: counts || [] });
  } catch {
    return privateJson({ error: "unavailable" }, 503);
  }
}
