import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "Aloha AI — Find where AI belongs", template: "%s · Aloha AI" },
  description: "Evidence-grounded decision, workflow, and implementation work from Honolulu, Hawaiʻi.",
  other: { "codex-preview": "development" },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
