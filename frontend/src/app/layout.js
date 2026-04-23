import "./globals.css";

export const metadata = {
  title: "LUCY — AI Digital Twin",
  description: "A JARVIS-like AI digital twin assistant with voice, vision, memory, and adaptive personality.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
