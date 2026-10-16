import { z } from "zod";
import type { Member } from "./data";
import type { ProfileContext } from "@/components/member/context-form";
const country = z.string().regex(/^([A-Z]{2})?$/);
const short = z
  .string()
  .trim()
  .max(100)
  .refine((x) => !/[\u0000-\u001f]/.test(x));
export const matchmakingSchema = z
  .object({
    min_age: z.number().int().min(18).max(125),
    max_age: z.number().int().min(18).max(125),
    genders: z
      .array(z.enum(["woman", "man", "nonbinary", "undisclosed"]))
      .max(4),
    countries: z.array(z.string().regex(/^[A-Z]{2}$/)).max(20),
    languages: z.array(z.string().regex(/^[a-z][a-z0-9-]{0,30}$/)).max(20),
    purpose: short,
    relocation: z.enum(["", "yes", "maybe", "no"]),
    looking_for: z
      .string()
      .trim()
      .max(600)
      .refine((x) => !/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/.test(x)),
    share_summary: z.boolean(),
  })
  .refine((x) => x.max_age >= x.min_age);
export type MatchmakingPreferences = z.infer<typeof matchmakingSchema>;
export const emptyMatchmaking: MatchmakingPreferences = {
  min_age: 18,
  max_age: 100,
  genders: [],
  countries: [],
  languages: [],
  purpose: "",
  relocation: "",
  looking_for: "",
  share_summary: false,
};
export const candidateFiltersSchema = z
  .object({
    gender: z
      .enum(["", "woman", "man", "nonbinary", "undisclosed"])
      .default(""),
    min_age: z.number().int().min(18).max(125).default(18),
    max_age: z.number().int().min(18).max(125).default(125),
    country: country.default(""),
    city: short.default(""),
    nationality: country.default(""),
    purpose: short.default(""),
    language: short.default(""),
    interest: short.default(""),
    education: short.default(""),
    profession: short.default(""),
    relocation: z.enum(["", "yes", "maybe", "no"]).default(""),
    future_country: country.default(""),
    children: z.enum(["", "yes", "no", "discuss"]).default(""),
    with_photo: z.boolean().default(false),
    name: short.default(""),
  })
  .refine((x) => x.max_age >= x.min_age);
export type CandidateFilters = z.infer<typeof candidateFiltersSchema>;
export type PreferenceFit =
  "gender" | "age" | "country" | "purpose" | "language" | "relocation";
export function preferenceFit(
  p: MatchmakingPreferences | null | undefined,
  m: Member,
): PreferenceFit[] {
  if (!p) return [];
  const rows: PreferenceFit[] = [];
  if (
    p.genders.length &&
    p.genders.includes(m.gender as MatchmakingPreferences["genders"][number])
  )
    rows.push("gender");
  if (m.age >= p.min_age && m.age <= p.max_age) rows.push("age");
  if (p.countries.length && p.countries.includes(m.country))
    rows.push("country");
  if (p.purpose && m.purposes.includes(p.purpose)) rows.push("purpose");
  if (p.languages.length && m.speaks.some((x) => p.languages.includes(x)))
    rows.push("language");
  if (
    p.relocation &&
    m.context?.shared &&
    m.context.relocation === p.relocation
  )
    rows.push("relocation");
  return rows;
}
export function sharedLife(
  a: ProfileContext | null | undefined,
  b: ProfileContext | null | undefined,
) {
  if (!a?.shared || !b?.shared)
    return { relocation: false, countries: [] as string[] };
  const countries = [
    ...new Set([
      ...(a.destinations || []),
      ...(a.future_country ? [a.future_country] : []),
    ]),
  ]
    .filter((x) => (b.destinations || []).includes(x) || b.future_country === x)
    .sort();
  return {
    relocation: a.relocation === "yes" && b.relocation === "yes",
    countries,
  };
}
