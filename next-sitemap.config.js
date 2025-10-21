/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
  generateRobotsTxt: true,
  generateIndexSitemap: true,
  exclude: [
    '/dashboard/*',
    '/unauthorized',
    '/login',
    '/signup',
    '/special-access/*',
  ],
  robotsTxtOptions: {
    policies: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/dashboard',
          '/unauthorized',
          '/login',
          '/signup',
          '/special-access',
        ],
      },
      {
        userAgent: '*',
        allow: ['/articles', '/categories', '/business', '/health', '/lifestyle', '/sports', '/tv'],
      },
    ],
    additionalSitemaps: [
      `${process.env.NEXT_PUBLIC_SITE_URL}/articles-sitemap.xml`,
      `${process.env.NEXT_PUBLIC_SITE_URL}/categories-sitemap.xml`,
    ],
  },
  transform: async (config, path) => {
    // Custom priority based on path
    let priority = 0.7;
    if (path === '/') priority = 1.0;
    else if (path.startsWith('/articles/')) priority = 0.9;
    else if (path.startsWith('/categories/')) priority = 0.8;
    else if (path.match(/^\/(business|health|lifestyle|sports|tv)$/)) priority = 0.8;

    // Custom change frequency based on content type
    let changefreq = 'weekly';
    if (path === '/') changefreq = 'daily';
    else if (path === '/articles' || path.startsWith('/articles/')) changefreq = 'daily';
    else if (path.match(/^\/(business|health|lifestyle|sports|tv)$/)) changefreq = 'daily';

    return {
      loc: path,
      changefreq,
      priority,
      lastmod: new Date().toISOString(),
    };
  },
  additionalPaths: async (config) => {
    return [
      {
        loc: '/articles',
        changefreq: 'daily',
        priority: 0.9,
        lastmod: new Date().toISOString(),
      },
      {
        loc: '/categories',
        changefreq: 'daily',
        priority: 0.8,
        lastmod: new Date().toISOString(),
      },
    ];
  },
};