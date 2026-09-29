import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement> & { size?: number };

function Icon({ size = 22, children, ...props }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      {...props}
    >
      {children}
    </svg>
  );
}

export const CloseIcon = (p: IconProps) => (
  <Icon {...p}><path d="M6 6l12 12M18 6L6 18" /></Icon>
);

export const SoundIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="M4 9.5h3l4.5-4v13L7 14.5H4z" />
    <path d="M15.5 9a4.2 4.2 0 0 1 0 6M18 6.5a8 8 0 0 1 0 11" />
  </Icon>
);

export const MuteIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="M4 9.5h3l4.5-4v13L7 14.5H4z" />
    <path d="M16 9.5l5 5M21 9.5l-5 5" />
  </Icon>
);

export const MusicIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="M9 18V6.5l10-2V16" />
    <circle cx="6.5" cy="18" r="2.5" />
    <circle cx="16.5" cy="16" r="2.5" />
  </Icon>
);

export const GearIcon = (p: IconProps) => (
  <Icon {...p}>
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z" />
  </Icon>
);

export const PlayIcon = (p: IconProps) => (
  <Icon {...p}><path d="M8 5.5v13l10.5-6.5z" fill="currentColor" /></Icon>
);

export const PauseIcon = (p: IconProps) => (
  <Icon {...p}><path d="M8.5 5.5v13M15.5 5.5v13" strokeWidth={2.4} /></Icon>
);

export const ResetIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="M4.5 12a7.5 7.5 0 1 0 2.2-5.3" />
    <path d="M4.5 4.5v3.8h3.8" />
  </Icon>
);

export const MinusIcon = (p: IconProps) => (
  <Icon {...p}><path d="M6 12h12" strokeWidth={2} /></Icon>
);

export const PlusIcon = (p: IconProps) => (
  <Icon {...p}><path d="M12 6v12M6 12h12" strokeWidth={2} /></Icon>
);

export const ExternalIcon = (p: IconProps) => (
  <Icon {...p}><path d="M14 5h5v5M19 5l-8 8M18 14v4a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h4" /></Icon>
);

/** Coarse grounds: a few irregular pebbles. */
export const GrindIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="M6.2 8.6c.9-1.3 2.9-1.2 3.4.2.5 1.3-.6 2.7-2 2.6-1.4 0-2.2-1.6-1.4-2.8z" />
    <path d="M13.6 6.2c1-.9 2.7-.4 2.9 1 .2 1.3-1 2.3-2.3 2-1.2-.3-1.6-2.1-.6-3z" />
    <path d="M11.4 13.2c1.2-1.2 3.4-.7 3.8.9.4 1.7-1.1 3.2-2.8 2.9-1.7-.3-2.2-2.6-1-3.8z" />
    <path d="M5.6 15.8c.7-.8 2-.5 2.3.5.2 1-.7 1.8-1.7 1.6-1-.2-1.3-1.4-.6-2.1z" />
    <path d="M17.6 13.4c.6-.6 1.7-.3 1.9.5.2.8-.5 1.5-1.3 1.4-.8-.1-1.1-1.3-.6-1.9z" />
  </Icon>
);

export const ThermoIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="M10 13.6V5.5a2 2 0 1 1 4 0v8.1a3.6 3.6 0 1 1-4 0z" />
    <path d="M12 9.5v6" strokeWidth={2.2} />
  </Icon>
);

export const ScaleIcon = (p: IconProps) => (
  <Icon {...p}>
    <rect x="3.5" y="11" width="17" height="8" rx="2.4" />
    <path d="M6.5 11c0-3 2.5-5.5 5.5-5.5s5.5 2.5 5.5 5.5" />
    <path d="M10 15h4" />
  </Icon>
);
