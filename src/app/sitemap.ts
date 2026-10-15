import type { MetadataRoute } from 'next';
import { siteUrl } from '@/lib/brand';
import { locales } from '@/lib/i18n';
export default function sitemap():MetadataRoute.Sitemap { const origin=siteUrl(); return origin?locales.map(l=>({url:new URL(`/${l}`,origin).toString()})):[]; }
