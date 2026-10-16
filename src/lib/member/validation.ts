import { z } from "zod";
export function ageFromDob(dob: string, now = new Date()) {
  const d = new Date(`${dob}T00:00:00Z`);
  if (Number.isNaN(d.getTime()) || d.toISOString().slice(0, 10) !== dob)
    return -1;
  return (
    now.getUTCFullYear() -
    d.getUTCFullYear() -
    (now.getUTCMonth() < d.getUTCMonth() ||
    (now.getUTCMonth() === d.getUTCMonth() && now.getUTCDate() < d.getUTCDate())
      ? 1
      : 0)
  );
}
const text = (min: number, max: number) =>
  z
    .string()
    .trim()
    .min(min)
    .max(max)
    .refine((v) => !/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/.test(v));
const codes = (min: number, max: number) =>
  z
    .array(z.string().regex(/^[a-z][a-z0-9-]{0,30}$/))
    .min(min)
    .max(max)
    .transform((v) => [...new Set(v)]);
export const profileSchema = z.object({
  display_name: text(2, 60),
  date_of_birth: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .refine((d) => d >= "1900-01-01" && ageFromDob(d) >= 18),
  gender: z.enum(["woman", "man", "nonbinary", "undisclosed"]),
  country: z.string().regex(/^[A-Z]{2}$/),
  city: text(1, 80),
  biography: text(20, 1000),
  discoverable: z.boolean(),
  purposes: codes(1, 5),
  speaks: codes(1, 15),
  learns: codes(0, 15),
  interests: codes(1, 20),
});
export const reportCategories = [
  "fake",
  "scam",
  "harassment",
  "content",
  "impersonation",
  "underage",
  "spam",
  "other",
] as const;
export const uuid = z.string().uuid();
export const password = z.string().min(12).max(128);
export const email = z
  .email()
  .max(254)
  .transform((v) => v.trim().toLowerCase());
export function completion(
  p: Record<string, unknown> | null,
  hasPhoto: boolean,
) {
  const checks = [
    profileSchema
      .pick({
        display_name: true,
        date_of_birth: true,
        gender: true,
        country: true,
        city: true,
      })
      .safeParse(p).success,
    Boolean((p?.purposes as unknown[])?.length),
    Boolean((p?.speaks as unknown[])?.length),
    Boolean((p?.interests as unknown[])?.length),
    text(20, 1000).safeParse(p?.biography).success,
    hasPhoto,
    Boolean(p?.safety_acknowledged_at),
  ];
  return Math.round((checks.filter(Boolean).length / checks.length) * 100);
}
export const preferencesSchema = z
  .object({
    country: z.string().regex(/^([A-Z]{2})?$/),
    min_age: z.number().int().min(18).max(125),
    max_age: z.number().int().min(18).max(125),
    purpose: z.string().max(31),
    language: z.string().max(31),
    interest: z.string().max(31),
  })
  .refine((v) => v.max_age >= v.min_age);
export const messageSchema = z.object({
  conversation: uuid,
  body: text(1, 2000),
  request_id: uuid,
});
export const messageCursor = z
  .string()
  .regex(/^[1-9]\d{0,18}$/)
  .refine((v) => BigInt(v) <= 9223372036854775807n);

export const contextSchema = z.object({
  nationality: z.string().regex(/^([A-Z]{2})?$/),
  future_country: z.string().regex(/^([A-Z]{2})?$/),
  relocation: z.enum(["", "yes", "maybe", "no"]),
  education: text(0, 100),
  profession: text(0, 100),
  children: z.enum(["", "yes", "no", "discuss"]),
  destinations: z.array(z.string().regex(/^[A-Z]{2}$/)).max(20),
  shared: z.boolean(),
});
