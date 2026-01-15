import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function isMobile(): boolean {
  const userAgent = navigator.userAgent.toLowerCase();
  const mobilePatterns = [
    /android/,
    /webos/,
    /iphone/,
    /ipad/,
    /ipod/,
    /blackberry/,
    /windows phone/,
    /mobile/,
  ];

  const isMobileUserAgent = mobilePatterns.some((pattern) =>
    pattern.test(userAgent)
  );

  const isMobileViewport =
    typeof window !== "undefined" && window.innerWidth <= 768;

  return isMobileUserAgent || isMobileViewport;
}
