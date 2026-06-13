import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const base = 'https://inframindhq.online';
  return [
    { url: `${base}/`, lastModified: new Date(), priority: 1 },
    { url: `${base}/signup`, lastModified: new Date(), priority: 0.9 },
    { url: `${base}/login`, lastModified: new Date(), priority: 0.5 },
    { url: `${base}/privacy`, lastModified: new Date(), priority: 0.3 },
    { url: `${base}/terms`, lastModified: new Date(), priority: 0.3 },
    { url: `${base}/contact`, lastModified: new Date(), priority: 0.4 },
  ];
}
