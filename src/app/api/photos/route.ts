import { boundedBody } from "@/lib/member/body";
import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { supabase, storageAdmin, configured } from "@/lib/supabase/server";
import { sameOrigin, failure } from "@/lib/member/http";
import { normalizePhoto, MAX_PHOTO_BYTES } from "@/lib/member/photo";
export async function POST(request: Request) {
  if (!sameOrigin(request)) return failure("requestFailed", 403);
  if (!configured() || !process.env.SUPABASE_SERVICE_ROLE_KEY)
    return failure("backendUnavailable", 503);
  try {
    const db = await supabase(),
      {
        data: { user },
      } = await db.auth.getUser();
    if (!user || !user.email_confirmed_at) return failure("loginRequired", 401);
    const { data: active } = await db.rpc("member_active");
    if (!active) return failure("accountUnavailable", 403);
    const { error: throttled } = await db.rpc("photo_attempt");
    if (throttled) return failure("rateLimited", 429);
    const { data: profile } = await db
      .from("profiles")
      .select("public_id")
      .eq("user_id", user.id)
      .maybeSingle();
    if (!profile) return failure("invalidInput");
    const bytes = await boundedBody(request, MAX_PHOTO_BYTES + 16384);
    const form = await new Response(new Uint8Array(bytes), {
      headers: { "Content-Type": request.headers.get("content-type") || "" },
    }).formData();
    const file = form.get("photo");
    if (
      !(file instanceof File) ||
      !["image/jpeg", "image/png", "image/webp"].includes(file.type)
    )
      return failure("invalidPhoto");
    const output = await normalizePhoto(Buffer.from(await file.arrayBuffer()));
    const path = `${user.id}/${randomUUID()}.webp`,
      admin = storageAdmin();
    const { data: old } = await db
      .from("profile_photos")
      .select("storage_path")
      .eq("user_id", user.id)
      .maybeSingle();
    const { error: uploadError } = await admin.storage
      .from("profile-photos")
      .upload(path, output, { contentType: "image/webp", upsert: false });
    if (uploadError) return failure();
    const { error } = await admin.rpc("register_photo", {
      owner_id: user.id,
      object_path: path,
    });
    if (error) {
      await admin.storage.from("profile-photos").remove([path]);
      return failure();
    }
    if (old?.storage_path)
      await admin.storage.from("profile-photos").remove([old.storage_path]);
    const { data: updated } = await db
      .from("profile_photos")
      .select("id")
      .eq("user_id", user.id)
      .single();
    return NextResponse.json({ ok: true, photoId: updated?.id });
  } catch {
    return failure("invalidPhoto");
  }
}
export async function DELETE(request: Request) {
  if (!sameOrigin(request)) return failure("requestFailed", 403);
  if (!configured() || !process.env.SUPABASE_SERVICE_ROLE_KEY)
    return failure("backendUnavailable", 503);
  try {
    const db = await supabase(),
      {
        data: { user },
      } = await db.auth.getUser();
    if (!user) return failure("loginRequired", 401);
    const { data: photo } = await db
      .from("profile_photos")
      .select("storage_path")
      .eq("user_id", user.id)
      .maybeSingle();
    const { error } = await db.rpc("remove_photo");
    if (error) return failure();
    if (photo)
      await storageAdmin()
        .storage.from("profile-photos")
        .remove([photo.storage_path]);
    return NextResponse.json({ ok: true });
  } catch {
    return failure();
  }
}
