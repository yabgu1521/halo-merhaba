import { z } from "zod";
import { statuses } from "@/lib/intake";
import {
  authConfigured,
  authorizedAdmin,
  privateJson,
  readJson,
  sameOrigin,
} from "@/lib/server";
const uuid = z.uuid();
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!authConfigured()) return privateJson({ error: "not_configured" }, 503);
  try {
    const admin = await authorizedAdmin();
    if (!admin) return privateJson({ error: "unauthorized" }, 401);
    const id = uuid.parse((await params).id);
    const { data: lead, error } = await admin.db
      .from("halo_leads")
      .select("*")
      .eq("id", id)
      .maybeSingle();
    if (error) return privateJson({ error: "unavailable" }, 503);
    if (!lead) return privateJson({ error: "not_found" }, 404);
    const { data: notes, error: noteError } = await admin.db
      .from("halo_lead_notes")
      .select("id,body,created_at")
      .eq("lead_id", id)
      .order("created_at");
    if (noteError) return privateJson({ error: "unavailable" }, 503);
    return privateJson({ lead, notes: notes || [] });
  } catch {
    return privateJson({ error: "invalid_input" }, 400);
  }
}
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!sameOrigin(request)) return privateJson({ error: "forbidden" }, 403);
  if (!authConfigured()) return privateJson({ error: "not_configured" }, 503);
  try {
    const admin = await authorizedAdmin();
    if (!admin) return privateJson({ error: "unauthorized" }, 401);
    const id = uuid.parse((await params).id),
      body = z
        .object({
          status: z.enum(statuses).optional(),
          note: z.string().trim().min(1).max(3000).optional(),
        })
        .strict()
        .refine((p) => Boolean(p.status || p.note))
        .parse(await readJson(request, 5000));
    const { error } = await admin.db.rpc("halo_admin_update_lead", {
      p_id: id,
      p_status: body.status || null,
      p_note: body.note || null,
    });
    if (error) return privateJson({ error: "unavailable" }, 503);
    return privateJson({ ok: true });
  } catch {
    return privateJson({ error: "invalid_input" }, 400);
  }
}
