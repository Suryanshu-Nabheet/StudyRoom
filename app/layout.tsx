import type { Metadata } from "next";
import "./globals.css";
import { ToastContainer } from "@/components/ui/toast";

export const metadata: Metadata = {
  title: "Study Room - Premium Video Meetings",
  description: "Connect, collaborate, and study together with premium peer-to-peer video meetings",
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
      <body>
        {children}
        <ToastContainer />
      </body>
    </html>
  );
}
