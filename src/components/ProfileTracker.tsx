"use client";

import { useEffect } from "react";
import { trackPageView } from "@/lib/analytics";

type ProfileTrackerProps = {
  profileId: string;
  cardCode?: string;
};

export function ProfileTracker({ profileId, cardCode }: ProfileTrackerProps) {
  useEffect(() => {
    trackPageView({ profileId, cardCode });
  }, [profileId, cardCode]);

  return null;
}
