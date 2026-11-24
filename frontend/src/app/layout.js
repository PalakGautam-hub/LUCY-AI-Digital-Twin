import "./globals.css";

export const metadata = {
  title: "L.U.C.Y. — AI Digital Twin",
  description: "JARVIS-class AI digital twin with customizable humanoid avatar, voice, vision, memory, and adaptive personality.",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "LUCY AI",
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: "#04040c",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="format-detection" content="telephone=no" />
      </head>
      <body>{children}</body>
    </html>
  );
}
