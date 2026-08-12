import { useEffect, useMemo, useState } from 'react';

const W = 600;
const H = 200;
const PAD = { top: 16, right: 24, bottom: 32, left: 30 };

const BookingChart = ({ data = [] }) => {
  const [hover, setHover] = useState(null);
  const [drawn, setDrawn] = useState(false);

  useEffect(() => {
    setHover(null);
    setDrawn(false);
    const t = setTimeout(() => setDrawn(true), 60);
    return () => clearTimeout(t);
  }, [data]);

  const points = useMemo(() => {
    const max = Math.max(...data.map((d) => d.value), 1);
    const innerW = W - PAD.left - PAD.right;
    const innerH = H - PAD.top - PAD.bottom;
    return data.map((d, i) => {
      const x = PAD.left + (i * innerW) / (data.length - 1 || 1);
      const y = H - PAD.bottom - (d.value / max) * innerH;
      return { x, y, label: d.label, value: d.value };
    });
  }, [data]);

  if (data.length === 0 || data.every((d) => d.value === 0)) {
    return (
      <div className="flex flex-col items-center justify-center py-14 text-center">
        <div className="w-16 h-16 bg-amber-50 rounded-2xl flex items-center justify-center mb-4 text-3xl">
          📊
        </div>
        <p className="text-stone-600 font-bold">Not enough booking activity yet</p>
        <p className="text-stone-400 text-sm mt-1">Your monthly booking trends will appear here.</p>
      </div>
    );
  }

  const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' ');
  const areaPath = `${linePath} L${points[points.length - 1].x},${H - PAD.bottom} L${points[0].x},${H - PAD.bottom} Z`;
  const maxVal = Math.max(...data.map((d) => d.value), 1);

  return (
    <div className="relative">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto select-none" role="img" aria-label="Booking activity chart">
        <defs>
          <linearGradient id="vf-area-grad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.32" />
            <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.02" />
          </linearGradient>
          <linearGradient id="vf-line-grad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#fbbf24" />
            <stop offset="100%" stopColor="#d97706" />
          </linearGradient>
        </defs>

        {[0, 0.5, 1].map((f) => {
          const y = H - PAD.bottom - f * (H - PAD.top - PAD.bottom);
          return (
            <g key={f}>
              <line x1={PAD.left} x2={W - PAD.right} y1={y} y2={y} stroke="#f1ece2" strokeWidth="1" strokeDasharray={f === 0 ? '0' : '4 4'} />
              <text x={PAD.left - 8} y={y + 4} textAnchor="end" fontSize="10" fill="#a8a29e" fontWeight="600">
                {Math.round(maxVal * f)}
              </text>
            </g>
          );
        })}

        <path d={areaPath} fill="url(#vf-area-grad)" className="transition-opacity duration-1000" style={{ opacity: drawn ? 1 : 0 }} />

        <path
          d={linePath}
          fill="none"
          stroke="url(#vf-line-grad)"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          pathLength="1000"
          style={{
            strokeDasharray: 1000,
            strokeDashoffset: drawn ? 0 : 1000,
            transition: 'stroke-dashoffset 1.2s cubic-bezier(0.4, 0, 0.2, 1)',
          }}
        />

        {points.map((p, i) => (
          <g key={i}>
            {hover?.index === i && (
              <line x1={p.x} x2={p.x} y1={PAD.top - 4} y2={H - PAD.bottom} stroke="#f59e0b" strokeWidth="1" strokeDasharray="3 3" className="opacity-60" />
            )}
            <circle
              cx={p.x}
              cy={p.y}
              r={hover?.index === i ? 7 : 4.5}
              fill="#ffffff"
              stroke="#d97706"
              strokeWidth="2.5"
              className="transition-all duration-150 cursor-pointer"
              onMouseEnter={() => setHover({ ...p, index: i })}
              onMouseLeave={() => setHover(null)}
            />
          </g>
        ))}

        {points.map((p, i) => (
          <text key={`t${i}`} x={p.x} y={H - 10} textAnchor="middle" fontSize="10" fill="#78716c" fontWeight="700">
            {p.label}
          </text>
        ))}
      </svg>

      {hover && (
        <div
          className="absolute z-10 -translate-x-1/2 pointer-events-none"
          style={{
            left: `${(hover.x / W) * 100}%`,
            top: `${(hover.y / H) * 100}%`,
            transform: 'translate(-50%, -115%)',
          }}
        >
          <div className="bg-stone-900 text-white text-xs font-bold px-3 py-2 rounded-lg shadow-xl whitespace-nowrap">
            {hover.label}
            <span className="ml-2 text-amber-400">{hover.value} booking{hover.value === 1 ? '' : 's'}</span>
            <div className="absolute left-1/2 -bottom-1 w-2 h-2 bg-stone-900 rotate-45 -translate-x-1/2"></div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookingChart;
