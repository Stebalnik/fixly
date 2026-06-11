export const GA_ID = process.env.NEXT_PUBLIC_GA_ID ?? "";

type GTagEvent = {
  action: string;
  category: string;
  label?: string;
  value?: number;
};

export function gtag(...args: unknown[]) {
  if (typeof window === "undefined") return;
  (window as unknown as { dataLayer: unknown[] }).dataLayer?.push(args);
}

export function trackEvent({ action, category, label, value }: GTagEvent) {
  if (typeof window === "undefined") return;
  (window as unknown as { gtag: (...args: unknown[]) => void }).gtag?.(
    "event",
    action,
    {
      event_category: category,
      event_label: label,
      value,
    }
  );
}