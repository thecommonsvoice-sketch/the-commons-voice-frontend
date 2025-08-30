/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
  generateRobotsTxt: true,
  exclude: ['/dashboard/*', '/unauthorized'],
  generateIndexSitemap: false,
  transform: async (config, path) => {
    return {
      loc: path,
      changefreq: path === '/' ? 'daily' : 'weekly',
      priority: path === '/' ? 1.0 : 0.7,
      lastmod: new Date().toISOString(),
    };
  },
  additionalPaths: async (config) => {
    // In a real app, you would fetch your actual articles and categories
    return [
      {
        loc: '/articles',
        changefreq: 'daily',
        priority: 0.8,
        lastmod: new Date().toISOString(),
      },
    ];
  },
};