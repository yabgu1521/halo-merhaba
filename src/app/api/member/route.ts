import { boundedBody } from "@/lib/member/body";
import { NextResponse } from "next/server";
import { z } from "zod";
import { supabase, configured } from "@/lib/supabase/server";
import { sameOrigin, failure } from "@/lib/member/http";
import {
  profileSchema,
  uuid,
  reportCategories,
  preferencesSchema,
  messageSchema,
  messageCursor,
} from "@/lib/member/validation";
export async function POST(request: Request) {
  if (!sameOrigin(request)) return failure("requestFailed", 403);
  if (!configured()) return failure("backendUnavailable", 503);
  try {
    if (Number(request.headers.get("content-length") || 0) > 16000)
      return failure();
    const body = JSON.parse((await boundedBody(request, 16000)).toString()),
      db = await supabase();
    const {
      data: { user },
    } = await db.auth.getUser();
    if (!user || !user.email_confirmed_at) return failure("loginRequired", 401);
    let result;
    switch (body.action) {
      case "favorite":
        result = await db.rpc("set_favorite", {
          profile_id: uuid.parse(body.id),
          saved: z.boolean().parse(body.saved),
        });
        break;
      case "preferences":
        result = await db.rpc("save_preferences", {
          selection: preferencesSchema.parse(body.selection),
        });
        break;
      case "conversation":
        result = await db.rpc("open_conversation", {
          profile_id: uuid.parse(body.id),
        });
        break;
      case "send": {
        const m = messageSchema.parse(body);
        result = await db.rpc("send_message", {
          conversation: m.conversation,
          message_body: m.body,
          request_id: m.request_id,
        });
        break;
      }
      case "read":
        result = await db.rpc("mark_conversation_read", {
          conversation: uuid.parse(body.conversation),
          through_id: messageCursor.parse(body.through_id),
        });
        break;
      case "profile":
        result = await db.rpc("save_profile", {
          payload: profileSchema.parse(body.profile),
        });
        break;
      case "complete":
        if (body.safety !== true) return failure("safetyRequired");
        result = await db.rpc("complete_onboarding");
        break;
      case "like":
        result = await db.rpc("express_interest", {
          profile_id: uuid.parse(body.id),
        });
        break;
      case "block":
      case "unblock":
        result = await db.rpc("block_member", {
          profile_id: uuid.parse(body.id),
          remove_block: body.action === "unblock",
        });
        break;
      case "report":
        result = await db.rpc("report_profile", {
          profile_id: uuid.parse(body.id),
          report_category: z.enum(reportCategories).parse(body.category),
          report_notes: z
            .string()
            .trim()
            .max(1500)
            .parse(body.notes || ""),
        });
        break;
      default:
        return failure();
    }
    if (result.error)
      return failure(
        result.error.message === "Rate limit" ? "rateLimited" : "requestFailed",
      );
    return NextResponse.json({
      ok: true,
      conversationId: body.action === "conversation" ? result.data : undefined,
      matched: body.action === "like" && result.data === true,
    });
  } catch {
    return failure("invalidInput");
  }
}
