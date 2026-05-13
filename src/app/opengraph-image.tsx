import { ImageResponse } from 'next/og';
import { SITE_NAME, SITE_TAGLINE } from '@/lib/seo';

export const runtime = 'edge';
export const alt = `${SITE_NAME} — ${SITE_TAGLINE}`;
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '72px',
          backgroundColor: '#07070f',
          backgroundImage:
            'radial-gradient(at 18% 12%, rgba(139, 92, 246, 0.45) 0px, transparent 45%), radial-gradient(at 82% 18%, rgba(34, 211, 238, 0.32) 0px, transparent 50%), radial-gradient(at 50% 92%, rgba(16, 185, 129, 0.26) 0px, transparent 55%)',
          fontFamily: 'sans-serif',
          color: 'white',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            padding: '10px 22px',
            background: 'rgba(255,255,255,0.08)',
            border: '1px solid rgba(255,255,255,0.16)',
            borderRadius: '999px',
            alignSelf: 'flex-start',
            fontSize: '24px',
            color: '#cbd5e1',
          }}
        >
          <svg
            width="28"
            height="28"
            viewBox="0 0 24 24"
            fill="none"
            stroke="white"
            strokeWidth="2"
          >
            <rect x="3" y="3" width="18" height="18" rx="4" />
            <circle cx="8.5" cy="8.5" r="1" fill="white" />
            <circle cx="15.5" cy="8.5" r="1" fill="white" />
            <circle cx="12" cy="12" r="1" fill="white" />
            <circle cx="8.5" cy="15.5" r="1" fill="white" />
            <circle cx="15.5" cy="15.5" r="1" fill="white" />
          </svg>
          <span>Free Online Scorecard</span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <h1
            style={{
              fontSize: '128px',
              lineHeight: 1.0,
              fontWeight: 800,
              margin: 0,
              letterSpacing: '-0.04em',
              display: 'flex',
              flexWrap: 'wrap',
              gap: '24px',
            }}
          >
            <span
              style={{
                backgroundImage: 'linear-gradient(120deg, #a78bfa 0%, #22d3ee 50%, #34d399 100%)',
                backgroundClip: 'text',
                color: 'transparent',
              }}
            >
              Yahtzee
            </span>
            <span>Scorecard</span>
          </h1>
          <p
            style={{
              fontSize: '36px',
              lineHeight: 1.3,
              color: '#cbd5e1',
              margin: 0,
              maxWidth: '900px',
            }}
          >
            Up to 10 players. Auto-totals, upper bonus, Yahtzee bonus. No signup.
          </p>
        </div>

        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-end',
            fontSize: '24px',
            color: '#94a3b8',
          }}
        >
          <span>Plays in your browser</span>
          <span style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <span
              style={{
                display: 'flex',
                width: '12px',
                height: '12px',
                borderRadius: '999px',
                background: '#10b981',
              }}
            />
            Free Forever
          </span>
        </div>
      </div>
    ),
    { ...size }
  );
}
