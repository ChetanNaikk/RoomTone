import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Roomtone — Share a moment, not just music",
  description:
    "Create an intimate room of music and memories. Share it with someone you love. Roomtone is an emotional storytelling experience, not a music player.",
  openGraph: {
    title: "Roomtone",
    description: "Share a moment, not just music.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Caveat:wght@400..700&family=Cormorant+Garamond:ital,wght@0,400;0,600;1,400&family=Inter:wght@300;400;500;600;700&family=Nunito:wght@400;600;700&family=Quicksand:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
