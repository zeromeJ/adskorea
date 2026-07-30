"use client";

import Link from "next/link";
import type { ComponentProps } from "react";
import { trackEvent, type TrackEventName } from "@/lib/trackEvent";

export default function TrackedLink({
  eventName,
  eventProperties,
  ...props
}: ComponentProps<typeof Link> & {
  eventName: TrackEventName;
  eventProperties?: Record<string, string | number | boolean>;
}) {
  return (
    <Link
      {...props}
      onClick={(event) => {
        trackEvent(eventName, eventProperties);
        props.onClick?.(event);
      }}
    />
  );
}
