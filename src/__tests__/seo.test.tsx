// src/__tests__/seo.test.tsx

import { render } from '@testing-library/react';

// The analytics package ships ESM only; the layout's metadata is all these tests need.
jest.mock('@vercel/analytics/next', () => ({ Analytics: () => null }));

const SERVED = 'https://www.yahtzeescorekeeper.com';
const APEX = /https?:\/\/yahtzeescorekeeper\.com/;

// Load the SEO surfaces fresh with NEXT_PUBLIC_SITE_URL unset, so the tests
// check the default the site falls back to.
function loadSeoModules() {
  const saved = process.env.NEXT_PUBLIC_SITE_URL;
  delete process.env.NEXT_PUBLIC_SITE_URL;
  let modules!: {
    seo: typeof import('@/lib/seo');
    layout: typeof import('@/app/layout');
    sitemap: typeof import('@/app/sitemap').default;
    robots: typeof import('@/app/robots').default;
    StructuredData: typeof import('@/components/StructuredData').default;
  };
  jest.isolateModules(() => {
    modules = {
      seo: require('@/lib/seo'),
      layout: require('@/app/layout'),
      sitemap: require('@/app/sitemap').default,
      robots: require('@/app/robots').default,
      StructuredData: require('@/components/StructuredData').default,
    };
  });
  if (saved !== undefined) process.env.NEXT_PUBLIC_SITE_URL = saved;
  return modules;
}

describe('site address', () => {
  const { seo, layout, sitemap, robots, StructuredData } = loadSeoModules();

  it('defaults to the www address the site serves', () => {
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
    expect(new URL(String(metadata.alternates?.canonical), base).href).toBe(`${SERVED}/`);
    expect(new URL(String(metadata.openGraph?.url), base).href).toBe(`${SERVED}/`);
  });

  it('uses the www address in every JSON-LD url', () => {
    const { container } = render(<StructuredData />);
    const scripts = Array.from(container.querySelectorAll('script[type="application/ld+json"]'));
    expect(scripts.length).toBeGreaterThan(0);
    const json = scripts.map((s) => s.innerHTML).join('\n');
    expect(json).toContain(SERVED);
    expect(json).not.toMatch(APEX);
  });
});
