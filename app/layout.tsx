import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://aloha-ai-consulting.vercel.app"),
  title: { default: "Aloha AI — Make complex AI work concrete", template: "%s · Aloha AI" },
  description: "RN Collins researches complex organizations and work, finds the gaps, and turns them into useful strategy, systems, tools, learning, and builds.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
