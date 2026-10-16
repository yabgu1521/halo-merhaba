import { z } from "zod";
import type { LeadKind } from "@/content/services";
const kinds = [
  "marriage",
  "documents",
  "translation",
  "interpreter",
  "consultation",
  "course",
  "precheck",
  "product_interest",
] as const;
const safeString = z.string().trim().max(600);
export const statuses = [
  "new",
  "contacted",
  "waiting",
  "in_progress",
  "completed",
  "closed",
] as const;
export type LeadStatus = (typeof statuses)[number];
export const answerKeys = [
  "nationality",
  "currentCountry",
  "targetCountry",
  "topic",
  "processType",
  "documentCategory",
  "sourceLanguage",
  "targetLanguage",
  "documentType",
  "pages",
  "deadline",
  "certified",
  "eventType",
  "mode",
  "city",
  "plannedDate",
  "duration",
  "preferredLanguage",
  "contactMethod",
  "level",
  "productId",
] as const;
export const intakeSchema = z
  .object({
    kind: z.enum(kinds),
    locale: z.enum(["id", "tr"]),
    name: z.string().trim().max(120),
    email: z
      .string()
      .trim()
      .max(254)
      .refine((v) => !v || z.email().safeParse(v).success),
    whatsapp: z
      .string()
      .trim()
      .max(30)
      .refine((v) => !v || /^\+?[0-9 ()-]{7,25}$/.test(v)),
    summary: z.string().trim().max(1800),
    answers: z
      .record(z.string(), safeString)
      .refine((a) =>
        Object.keys(a).every((k) =>
          (answerKeys as readonly string[]).includes(k),
        ),
      ),
    consent: z.literal(true),
    website: z.string().max(0),
  })
  .strict()
  .superRefine((data, ctx) => {
    const add = (key: string) =>
      ctx.addIssue({ code: "custom", path: [key], message: "required" });
    if (!data.email && !data.whatsapp) add("email");
    if (data.kind === "product_interest") {
      if (!data.email) add("email");
      if (!data.answers.productId) add("productId");
      return;
    }
    if (!data.name) add("name");
    if (data.summary.length < 8) add("summary");
    const required: Partial<Record<LeadKind, string[]>> = {
      precheck: [
        "nationality",
        "processType",
        "documentCategory",
        "targetCountry",
      ],
      translation: [
        "sourceLanguage",
        "targetLanguage",
        "documentType",
        "pages",
        "deadline",
        "certified",
      ],
      interpreter: [
        "eventType",
        "mode",
        "city",
        "currentCountry",
        "sourceLanguage",
        "targetLanguage",
        "plannedDate",
        "duration",
      ],
      consultation: [
        "topic",
        "currentCountry",
        "preferredLanguage",
        "contactMethod",
      ],
      course: ["level", "preferredLanguage"],
      marriage: ["nationality", "currentCountry"],
      documents: ["documentCategory", "targetCountry"],
    };
    for (const key of required[data.kind] || [])
      if (!data.answers[key]?.trim()) add(key);
    if (
      data.answers.pages &&
      (!/^\d+$/.test(data.answers.pages) ||
        Number(data.answers.pages) < 1 ||
        Number(data.answers.pages) > 10000)
    )
      add("pages");
    if (
      data.answers.duration &&
      (!/^\d+(\.\d+)?$/.test(data.answers.duration) ||
        Number(data.answers.duration) <= 0 ||
        Number(data.answers.duration) > 168)
    )
      add("duration");
    if (
      data.kind === "translation" &&
      data.answers.sourceLanguage === data.answers.targetLanguage
    )
      add("targetLanguage");
  });
export type Intake = z.infer<typeof intakeSchema>;
export function formatHandoff(
  data: Intake,
  labels: Record<string, string>,
  serviceName: string,
) {
  const lines = [
    `Halo Merhaba — ${serviceName}`,
    `${labels.name}: ${data.name || "—"}`,
    `${labels.email}: ${data.email || "—"}`,
    `${labels.whatsappContact}: ${data.whatsapp || "—"}`,
  ];
  for (const [key, value] of Object.entries(data.answers))
    if (value) lines.push(`${labels[key] || key}: ${value}`);
  if (data.summary) lines.push(`${labels.summary}: ${data.summary}`);
  return lines.join("\n");
}
