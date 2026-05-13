import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const size = { width: 180, height: 180 };
export const contentType = 'image/png';

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background:
            'radial-gradient(at 30% 25%, rgba(139,92,246,0.55) 0%, transparent 50%), linear-gradient(135deg, #0e0e1f 0%, #1e1b4b 100%)',
          color: 'white',
          fontSize: '110px',
          fontWeight: 800,
          letterSpacing: '-0.04em',
        }}
      >
        Y
      </div>
    ),
    { ...size }
  );
}
