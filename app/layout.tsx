import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AI WebRTC Study Rooms",
  description: "Real-time collaborative study rooms with AI transcription and summarization",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
      </head>
      <body>{children}</body>
    </html>
  );
}

