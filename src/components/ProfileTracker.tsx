"use client";

import { useEffect } from "react";
import { trackPageView } from "@/lib/analytics";

type ProfileTrackerProps = {
  slug: string;
  cardCode?: string;
};

export function ProfileTracker({ slug, cardCode }: ProfileTrackerProps) {
  useEffect(() => {
    trackPageView({ slug, cardCode });
  }, [slug, cardCode]);

  return null;
}
