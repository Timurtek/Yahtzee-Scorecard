/**
 * @jest-environment node
 */
// src/__tests__/seo.test.tsx
// Node environment: the llms routes return a web Response, which jsdom lacks.

import { renderToStaticMarkup } from 'react-dom/server';

// The analytics package ships ESM only; the layout's metadata is all these tests need.
jest.mock('@vercel/analytics/next', () => ({ Analytics: () => null }));

const SERVED = 'https://www.yahtzeescorekeeper.com';
const APEX = /https?:\/\/yahtzeescorekeeper\.com/;

// Load the SEO surfaces fresh with NEXT_PUBLIC_SITE_URL set to `envValue`
// (or unset), so each case sees the address a build with that env would emit.
function loadSeoModules(envValue: string | undefined) {
  const saved = process.env.NEXT_PUBLIC_SITE_URL;
  if (envValue === undefined) delete process.env.NEXT_PUBLIC_SITE_URL;
  else process.env.NEXT_PUBLIC_SITE_URL = envValue;
  let modules!: {
    seo: typeof import('@/lib/seo');
    layout: typeof import('@/app/layout');
    sitemap: typeof import('@/app/sitemap').default;
    robots: typeof import('@/app/robots').default;
    StructuredData: typeof import('@/components/StructuredData').default;
    llms: typeof import('@/app/llms.txt/route');
    llmsFull: typeof import('@/app/llms-full.txt/route');
  };
  jest.isolateModules(() => {
    modules = {
      seo: require('@/lib/seo'),
      layout: require('@/app/layout'),
      sitemap: require('@/app/sitemap').default,
      robots: require('@/app/robots').default,
      StructuredData: require('@/components/StructuredData').default,
      llms: require('@/app/llms.txt/route'),
      llmsFull: require('@/app/llms-full.txt/route'),
    };
  });
  if (saved === undefined) delete process.env.NEXT_PUBLIC_SITE_URL;
  else process.env.NEXT_PUBLIC_SITE_URL = saved;
  return modules;
}

describe.each([
  ['NEXT_PUBLIC_SITE_URL unset', undefined],
  ['NEXT_PUBLIC_SITE_URL set to the apex', 'https://yahtzeescorekeeper.com'],
])('site address with %s', (_label, envValue) => {
  const { seo, layout, sitemap, robots, StructuredData, llms, llmsFull } = loadSeoModules(envValue);

  it('is the www address the site serves', () => {
    expect(seo.SITE_URL).toBe(SERVED);
  });

  it('lists only real pages in the sitemap, on the www address', () => {
    const urls = sitemap().map((entry) => entry.url);
    expect(urls).toEqual([`${SERVED}/`]);
    urls.forEach((url) => expect(url).not.toContain('#'));
  });

  it('points robots.txt at the www sitemap and host', () => {
    const rules = robots();
    expect(rules.sitemap).toBe(`${SERVED}/sitemap.xml`);
    expect(rules.host).toBe(SERVED);
  });

  it('resolves the canonical and og:url to the www address', () => {
    const { metadata } = layout;
    const base = metadata.metadataBase as URL;
    expect(base.origin).toBe(SERVED);
    expect(new URL(String(metadata.alternates?.canonical), base).href).toBe(`${SERVED}/`);
    expect(new URL(String(metadata.openGraph?.url), base).href).toBe(`${SERVED}/`);
  });

  it('uses the www address in every JSON-LD url', () => {
    const html = renderToStaticMarkup(<StructuredData />);
    expect(html).toContain('application/ld+json');
    expect(html).toContain(SERVED);
    expect(html).not.toMatch(APEX);
  });

  it.each([
    ['/llms.txt', () => llms.GET()],
    ['/llms-full.txt', () => llmsFull.GET()],
  ])('serves %s with only the www address', async (_route, get) => {
    const body = await get().text();
    expect(body).toContain(`${SERVED}/`);
    expect(body).not.toMatch(APEX);
  });
});
