import type { MetadataRoute } from 'next';
import { siteUrl } from '@/lib/brand';
export default function robots():MetadataRoute.Robots { const origin=siteUrl(); return {rules:[{userAgent:'*',allow:['/en','/tr','/id'],disallow:['/app/','/admin/','/api/']}],...(origin?{sitemap:new URL('/sitemap.xml',origin).toString()}:{})}; }
