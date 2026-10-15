export const brand = { name: 'TurkIndo Connect', monogram: 'ti', countries: 'Türkiye × Indonesia' };
export function siteUrl() { const value = process.env.NEXT_PUBLIC_SITE_URL; return value ? new URL(value) : undefined; }
