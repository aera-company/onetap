import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement>;

const baseProps = {
  width: 20,
  height: 20,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.8,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true,
};

export function ArrowUpRightIcon(props: IconProps) {
  return (
    <svg {...baseProps} {...props}>
      <path d="M7 17 17 7" />
      <path d="M7 7h10v10" />
    </svg>
  );
}

export function MessageIcon(props: IconProps) {
  return (
    <svg {...baseProps} {...props}>
      <path d="M20 11.5a8 8 0 0 1-8.5 8 9 9 0 0 1-3.8-.9L3 20l1.4-4.1a8 8 0 1 1 15.6-4.4Z" />
      <path d="M8.5 12h.01M12 12h.01M15.5 12h.01" />
    </svg>
  );
}

export function ContactIcon(props: IconProps) {
  return (
    <svg {...baseProps} {...props}>
      <rect x="4" y="3.5" width="16" height="17" rx="2" />
      <path d="M8 2v3M16 2v3M8 15.5c.8-1.5 2-2.2 4-2.2s3.2.7 4 2.2" />
      <circle cx="12" cy="9.5" r="2" />
    </svg>
  );
}

export function CalendarIcon(props: IconProps) {
  return (
    <svg {...baseProps} {...props}>
      <rect x="3" y="5" width="18" height="16" rx="2" />
      <path d="M16 3v4M8 3v4M3 10h18" />
      <path d="M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01" />
    </svg>
  );
}

export function TapIcon(props: IconProps) {
  return (
    <svg {...baseProps} {...props}>
      <path d="M9 11.5V7a2 2 0 1 1 4 0v4" />
      <path d="M13 10a2 2 0 0 1 4 0v2" />
      <path d="M17 11a2 2 0 0 1 4 0v3c0 4-2.5 7-7 7h-1.2c-2.2 0-3.6-.8-4.8-2.5L4.4 13a2 2 0 0 1 3.2-2.4L9 12.2" />
    </svg>
  );
}
