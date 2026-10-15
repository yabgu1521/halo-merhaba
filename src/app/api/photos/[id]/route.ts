import { supabase, storageAdmin, configured } from "@/lib/supabase/server";
import { uuid } from "@/lib/member/validation";
export async function GET(
  _: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const deny = () =>
    new Response(null, {
      status: 404,
      headers: { "Cache-Control": "private, no-store" },
    });
  if (!configured()) return deny();
  try {
    const { id } = await params;
    if (!uuid.safeParse(id).success) return deny();
    const db = await supabase();
    const {
      data: { user },
    } = await db.auth.getUser();
    if (!user) return deny();
    const admin = storageAdmin();
    const { data: photo } = await admin
      .from("profile_photos")
      .select("storage_path,user_id")
      .eq("id", id)
      .maybeSingle();
    if (!photo) return deny();
    const { data: profile } = await admin
      .from("profiles")
      .select("public_id")
      .eq("user_id", photo.user_id)
      .maybeSingle();
    if (!profile) return deny();
    const { data: visible } = await db.rpc("member_profile", {
      profile_id: profile.public_id,
    });
    if (!visible || visible.photo_id !== id) return deny();
    const { data, error } = await admin.storage
      .from("profile-photos")
      .download(photo.storage_path);
    if (error || !data) return deny();
    return new Response(await data.arrayBuffer(), {
      headers: {
        "Content-Type": "image/webp",
        "Cache-Control": "private, no-store",
        "X-Content-Type-Options": "nosniff",
        "Content-Security-Policy": "default-src 'none'",
      },
    });
  } catch {
    return deny();
  }
}
