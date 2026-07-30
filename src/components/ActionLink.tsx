"use client";

import type { ReactNode } from "react";
import { trackEvent } from "@/lib/analytics";
import type { EventType } from "@/types/profile";

type ActionLinkProps = {
  href: string | null;
  icon: ReactNode;
  label: string;
  description?: string;
  eventType: EventType;
  profileId: string;
  cardCode?: string;
  primary?: boolean;
  external?: boolean;
};

export function ActionLink({
  href,
  icon,
  label,
  description,
  eventType,
  profileId,
  cardCode,
  primary,
  external,
}: ActionLinkProps) {
  const className = `action-link${primary ? " action-link--primary" : ""}${
    href ? "" : " action-link--disabled"
  }`;

  if (!href) {
    return (
      <span className={className} aria-disabled="true">
        <span className="action-link__icon">{icon}</span>
        <span className="action-link__copy">
          <span>{label}</span>
          {description ? <small>{description}</small> : null}
        </span>
      </span>
    );
  }

  return (
    <a
      className={className}
      href={href}
      onClick={() => trackEvent({ profileId, cardCode, eventType })}
      target={external ? "_blank" : undefined}
      rel={external ? "noreferrer" : undefined}
    >
      <span className="action-link__icon">{icon}</span>
      <span className="action-link__copy">
        <span>{label}</span>
        {description ? <small>{description}</small> : null}
      </span>
      <span className="action-link__arrow" aria-hidden="true">
        ↗
      </span>
    </a>
  );
}
