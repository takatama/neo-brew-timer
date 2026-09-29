import type { CSSProperties } from "react";

type IconName =
  | "arrow"
  | "plus"
  | "minus"
  | "sound"
  | "mute"
  | "pause"
  | "play"
  | "reset"
  | "settings"
  | "close"
  | "check"
  | "chevron"
  | "cup"
  | "thermometer"
  | "bean"
  | "book"
  | "external";
const paths: Record<IconName, React.ReactNode> = {
  arrow: (
    <>
      <path d="M4 12h16M14 6l6 6-6 6" />
    </>
  ),
  plus: <path d="M12 5v14M5 12h14" />,
  minus: <path d="M5 12h14" />,
  sound: (
    <>
      <path d="m11 5-6 4H2v6h3l6 4V5Z" />
      <path d="M15 8a6 6 0 0 1 0 8M18 5a10 10 0 0 1 0 14" />
    </>
  ),
  mute: (
    <>
      <path d="m11 5-6 4H2v6h3l6 4V5Z" />
      <path d="m16 9 6 6m0-6-6 6" />
    </>
  ),
  pause: (
    <>
      <path d="M8 5v14M16 5v14" strokeWidth="3" />
    </>
  ),
  play: <path d="m8 5 11 7-11 7V5Z" />,
  reset: (
    <>
      <path d="M4 10a8 8 0 1 1 1 8M4 4v6h6" />
    </>
  ),
  settings: (
    <>
      <path d="M4 7h16M4 17h16" />
      <circle cx="9" cy="7" r="3" fill="var(--md-surface)" />
      <circle cx="15" cy="17" r="3" fill="var(--md-surface)" />
    </>
  ),
  close: <path d="m6 6 12 12M18 6 6 18" />,
  check: <path d="m5 12 4 4L19 6" />,
  chevron: <path d="m7 10 5 5 5-5" />,
  cup: (
    <>
      <path d="M4 9h13v5a6.5 6.5 0 0 1-13 0V9ZM17 10h2a3 3 0 0 1 0 6h-2M3 22h16M8 2v3M13 1v4" />
    </>
  ),
  thermometer: (
    <>
      <path d="M9 14V5a3 3 0 0 1 6 0v9a5 5 0 1 1-6 0Z" />
      <path d="M12 8v11" />
    </>
  ),
  bean: (
    <>
      <ellipse cx="12" cy="12" rx="7" ry="10" transform="rotate(35 12 12)" />
      <path d="M16 4c-8 3 0 13-8 16" />
    </>
  ),
  book: (
    <>
      <path d="M12 6C9 3 5 3 2 4v15c4-1 7-1 10 2 3-3 6-3 10-2V4c-3-1-7-1-10 2v15" />
    </>
  ),
  external: (
    <>
      <path d="M14 3h7v7M21 3 10 14M11 4H4v16h16v-7" />
    </>
  ),
};
export function Icon({
  name,
  size = 20,
  style,
}: {
  name: IconName;
  size?: number;
  style?: CSSProperties;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.65"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      style={style}
    >
      {paths[name]}
    </svg>
  );
}
