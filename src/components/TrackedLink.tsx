"use client";

import type { ReactNode } from "react";
import { trackEvent } from "@/lib/analytics";
import type { EventType } from "@/types/profile";

type TrackedLinkProps = {
  href: string;
  children: ReactNode;
  className?: string;
  eventType: EventType;
  slug: string;
  cardCode?: string;
  external?: boolean;
};

export function TrackedLink({
  href,
  children,
  className,
  eventType,
  slug,
  cardCode,
  external,
}: TrackedLinkProps) {
  return (
    <a
      href={href}
      className={className}
      onClick={() => trackEvent({ slug, cardCode, eventType })}
      target={external ? "_blank" : undefined}
      rel={external ? "noreferrer" : undefined}
    >
      {children}
    </a>
  );
}
