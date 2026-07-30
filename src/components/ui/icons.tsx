// Stroke icons — they replace the emoji that used to do the work of icons.
// Emoji render differently on every OS, don't scale, and aren't read aloud by
// screen readers. Every icon here inherits its colours from the caller so the
// same shape can be active (filled) or inactive (outline only).

export interface IconProps {
  /** Filled + brand-coloured when true, plain outline when false. */
  active?: boolean;
  size?: number;
}

const STROKE_ON = "#1a6b3a";
const STROKE_OFF = "#8d8d84";
const FILL_ON = "#e4ede3";

function base({ active = false, size = 22 }: IconProps) {
  return {
    width: size,
    height: size,
    viewBox: "0 0 22 22",
    "aria-hidden": true as const,
    stroke: active ? STROKE_ON : STROKE_OFF,
    fill: active ? FILL_ON : "none",
  };
}

export function IconHome(props: IconProps) {
  const { stroke, fill, ...rest } = base(props);
  return (
    <svg {...rest}>
      <path
        d="M3.5 9.6 11 3.8l7.5 5.8V18a.8.8 0 0 1-.8.8H4.3a.8.8 0 0 1-.8-.8z"
        fill={fill}
        stroke={stroke}
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function IconPin(props: IconProps) {
  const { stroke, fill, ...rest } = base(props);
  return (
    <svg {...rest}>
      <path
        d="M11 19.5S17 14 17 9.6A6 6 0 0 0 5 9.6C5 14 11 19.5 11 19.5z"
        fill={fill}
        stroke={stroke}
        strokeWidth="1.7"
      />
      <circle cx="11" cy="9.6" r="2.2" fill={stroke} />
    </svg>
  );
}

export function IconList(props: IconProps) {
  const { stroke, fill, ...rest } = base(props);
  return (
    <svg {...rest}>
      <rect
        x="4.5"
        y="3.5"
        width="13"
        height="15"
        rx="1.6"
        fill={fill}
        stroke={stroke}
        strokeWidth="1.7"
      />
      <path d="M7.5 8h7M7.5 11.5h7M7.5 15h4" stroke={stroke} strokeWidth="1.7" />
    </svg>
  );
}

export function IconUser(props: IconProps) {
  const { stroke, fill, ...rest } = base(props);
  return (
    <svg {...rest}>
      <circle cx="11" cy="8" r="3.4" fill={fill} stroke={stroke} strokeWidth="1.7" />
      <path
        d="M4.5 18.5a6.5 6.5 0 0 1 13 0"
        fill="none"
        stroke={stroke}
        strokeWidth="1.7"
      />
    </svg>
  );
}

export function IconChart(props: IconProps) {
  const { stroke, fill, ...rest } = base(props);
  return (
    <svg {...rest}>
      <rect
        x="3.6"
        y="3.6"
        width="14.8"
        height="14.8"
        rx="2"
        fill={fill}
        stroke={stroke}
        strokeWidth="1.7"
      />
      <path
        d="M7.2 14.4v-3M11 14.4V7.6M14.8 14.4v-5"
        stroke={stroke}
        strokeWidth="1.7"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function IconStar(props: IconProps) {
  const { stroke, fill, ...rest } = base(props);
  return (
    <svg {...rest}>
      <path
        d="m11 3.8 2.3 4.7 5.2.75-3.75 3.65.9 5.15L11 15.6l-4.65 2.45.9-5.15L3.5 9.25l5.2-.75z"
        fill={fill}
        stroke={stroke}
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function IconStore(props: IconProps) {
  const { stroke, fill, ...rest } = base(props);
  return (
    <svg {...rest}>
      <path
        d="M4 8.2 5.3 4.3h11.4L18 8.2a2.1 2.1 0 0 1-3.5 1.9 2.1 2.1 0 0 1-3.5 0 2.1 2.1 0 0 1-3.5 0A2.1 2.1 0 0 1 4 8.2z"
        fill={fill}
        stroke={stroke}
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path
        d="M5.4 10.6v7.1h11.2v-7.1"
        fill="none"
        stroke={stroke}
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** The bag plaque icon — stock count over a photo, reused on every card. */
export function IconBag({ size = 11, color = "#134d29" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 22 22" aria-hidden="true">
      <path
        d="M5 8h12l-1 10.5H6z"
        fill="none"
        stroke={color}
        strokeWidth="1.9"
        strokeLinejoin="round"
      />
      <path
        d="M8.4 8V6.2a2.6 2.6 0 0 1 5.2 0V8"
        fill="none"
        stroke={color}
        strokeWidth="1.9"
      />
    </svg>
  );
}

export function IconClock({ size = 13, color = "#ffffff" }: { size?: number; color?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 22 22"
      aria-hidden="true"
      style={{ flexShrink: 0 }}
    >
      <circle cx="11" cy="11" r="7.5" fill="none" stroke={color} strokeWidth="1.8" />
      <path d="M11 7v4.4l3 1.8" stroke={color} strokeWidth="1.8" fill="none" />
    </svg>
  );
}

export const NAV_ICONS = {
  home: IconHome,
  pin: IconPin,
  list: IconList,
  user: IconUser,
  chart: IconChart,
  star: IconStar,
  store: IconStore,
} as const;

export type NavIconKey = keyof typeof NAV_ICONS;
