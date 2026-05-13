import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const size = { width: 180, height: 180 };
export const contentType = 'image/png';

export default function AppleIcon() {
  // 5-face die — matches /icon.svg, scaled up with extra polish for iOS home screen
  const dots = [
    { cx: 50, cy: 50 },
    { cx: 130, cy: 50 },
    { cx: 90, cy: 90 },
    { cx: 50, cy: 130 },
    { cx: 130, cy: 130 },
  ];
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#6366f1',
          backgroundImage:
            'radial-gradient(circle at 30% 25%, rgba(167, 139, 250, 0.85) 0%, transparent 55%), linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)',
        }}
      >
        <svg width="180" height="180" viewBox="0 0 180 180">
          {dots.map((d, i) => (
            <circle key={i} cx={d.cx} cy={d.cy} r="14" fill="#ffffff" />
          ))}
        </svg>
      </div>
    ),
    { ...size }
  );
}
