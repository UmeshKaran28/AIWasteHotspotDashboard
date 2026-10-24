import { useEffect, useState } from "react";

interface Props {
  score: number;
  size?: number;
  label?: string;
}

export default function RiskGauge({ score, size = 80, label }: Props) {
  const [animated, setAnimated] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => setAnimated(score), 100);
    return () => clearTimeout(timer);
  }, [score]);

  const r = (size / 2) * 0.72;
  const cx = size / 2;
  const cy = size / 2 + size * 0.08;
  const startAngle = -210;
  const sweepAngle = 240;
  const circumference = (Math.PI * r * sweepAngle) / 180;
  const progress = animated / 100;

  const polarToCartesian = (angle: number) => {
    const rad = ((angle - 90) * Math.PI) / 180;
    return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
  };

  const describeArc = (start: number, sweep: number) => {
    const s = polarToCartesian(start);
    const e = polarToCartesian(start + sweep);
    const large = sweep > 180 ? 1 : 0;
    return `M ${s.x} ${s.y} A ${r} ${r} 0 ${large} 1 ${e.x} ${e.y}`;
  };

  const color =
    score >= 75 ? "#ef4444" : score >= 45 ? "#f59e0b" : "#22c55e";
  const glow =
    score >= 75
      ? "rgba(239,68,68,0.5)"
      : score >= 45
        ? "rgba(245,158,11,0.5)"
        : "rgba(34,197,94,0.5)";

  const dashOffset = circumference * (1 - progress);

  return (
    <div className="flex flex-col items-center gap-1">
      <svg width={size} height={size * 0.82} viewBox={`0 0 ${size} ${size * 0.82}`}>
        <defs>
          <filter id={`glow-${score}`} x="-40%" y="-40%" width="180%" height="180%">
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        {/* Track */}
        <path
          d={describeArc(startAngle, sweepAngle)}
          fill="none"
          stroke="#1a2235"
          strokeWidth={size * 0.08}
          strokeLinecap="round"
        />
        {/* Fill */}
        <path
          d={describeArc(startAngle, sweepAngle)}
          fill="none"
          stroke={color}
          strokeWidth={size * 0.08}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
          style={{ transition: "stroke-dashoffset 1.2s cubic-bezier(0.4,0,0.2,1)" }}
          filter={`url(#glow-${score})`}
        />
        {/* Score */}
        <text
          x={cx}
          y={cy + 2}
          textAnchor="middle"
          dominantBaseline="middle"
          fill={color}
          fontSize={size * 0.22}
          fontFamily="'DM Mono', monospace"
          fontWeight="500"
        >
          {animated}
        </text>
        <text
          x={cx}
          y={cy + size * 0.2}
          textAnchor="middle"
          fill="#4a5a72"
          fontSize={size * 0.1}
          fontFamily="'DM Mono', monospace"
        >
          /100
        </text>
      </svg>
      {label && (
        <span
          style={{
            fontFamily: "'DM Mono', monospace",
            fontSize: "0.58rem",
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            color: glow,
          }}
        >
          {label}
        </span>
      )}
    </div>
  );
}
