import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://aloha-ai-consulting.vercel.app"),
  title: { default: "Aloha AI — Find where AI belongs", template: "%s · Aloha AI" },
  description: "Evidence-grounded decision, workflow, and implementation work from Honolulu, Hawaiʻi.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
