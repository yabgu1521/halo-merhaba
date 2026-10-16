import { intakeSchema } from "@/lib/intake";
import { products } from "@/content/catalog";
import {
  intakeClient,
  intakeConfigured,
  privateJson,
  rateHash,
  readJson,
  sameOrigin,
} from "@/lib/server";
export async function POST(request: Request) {
  if (!sameOrigin(request)) return privateJson({ error: "forbidden" }, 403);
  if (!intakeConfigured()) return privateJson({ error: "not_configured" }, 503);
  try {
    const parsed = intakeSchema.safeParse(await readJson(request));
    if (!parsed.success) return privateJson({ error: "invalid_input" }, 400);
    const p = parsed.data;
    if (
      p.kind === "product_interest" &&
      !products.some((product) => product.id === p.answers.productId)
    )
      return privateJson({ error: "invalid_input" }, 400);
    const { data, error } = await intakeClient().rpc("halo_submit_lead", {
      p_kind: p.kind,
      p_locale: p.locale,
      p_name: p.name,
      p_email: p.email,
      p_whatsapp: p.whatsapp,
      p_summary: p.summary,
      p_answers: p.answers,
      p_consent: p.consent,
      p_rate_key: rateHash(request),
    });
    if (error)
      return privateJson(
        {
          error:
            error.message === "halo_rate_limited"
              ? "rate_limited"
              : "unavailable",
        },
        error.message === "halo_rate_limited" ? 429 : 503,
      );
    if (typeof data !== "string" || !data)
      return privateJson({ error: "unavailable" }, 503);
    return privateJson({ id: data, stored: true }, 201);
  } catch {
    return privateJson({ error: "invalid_input" }, 400);
  }
}
