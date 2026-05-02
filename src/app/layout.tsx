import type { Metadata } from "next";
import "@/styles/globals.css";
import GoogleAnalytics from "@/components/GoogleAnalytics";

export const metadata: Metadata = {
  title: "Fixly — Home Services",
  description: "Find trusted local pros for any home service.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <GoogleAnalytics />
      </head>
      <body>{children}</body>
    </html>
  );
}