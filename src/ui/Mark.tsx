/** The app mark: a tiny version of the brewing dial, half full. */
export function Mark({ size = 28 }: { size?: number }) {
  const ticks = Array.from({ length: 10 }, (_, i) => {
    const a0 = (i / 10) * 2 * Math.PI - Math.PI / 2 + 0.16;
    const a1 = ((i + 1) / 10) * 2 * Math.PI - Math.PI / 2 - 0.16;
    const r = 14.2;
    const p = (a: number) => `${(16 + r * Math.cos(a)).toFixed(2)} ${(16 + r * Math.sin(a)).toFixed(2)}`;
    return `M${p(a0)}A${r} ${r} 0 0 1 ${p(a1)}`;
  });
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden="true" focusable="false">
      {ticks.map((d, i) => (
        <path key={i} d={d} fill="none" strokeWidth="2.2" strokeLinecap="round"
          stroke={i >= 8 ? "var(--accent)" : "var(--ink)"} opacity={i >= 8 ? 1 : 0.85} />
      ))}
      <clipPath id="mark-face"><circle cx="16" cy="16" r="10.6" /></clipPath>
      <circle cx="16" cy="16" r="10.6" fill="var(--dial-face)" />
      <g clipPath="url(#mark-face)">
        <path d="M2 17.2c3-1.6 6-1.6 9 0s6 1.6 9 0 6-1.6 9 0V30H2z" fill="var(--coffee)" />
      </g>
    </svg>
  );
}
