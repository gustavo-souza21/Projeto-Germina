import "bootstrap/dist/css/bootstrap.min.css";
import "./globals.css";
import Navbar from "@/components/Navbar";

export const metadata = {
  title: "GERMINA — Germinar conhecimento sobre plantas medicinais",
  description:
    "Plataforma gamificada de educação sobre plantas medicinais do Horto Municipal de Itacoatiara/AM.",
  manifest: "/manifest.json",
};

export const viewport = {
  themeColor: "#1b5e3f",
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <head>
        <link rel="icon" href="/icons/icon-192.png" />
        <link rel="apple-touch-icon" href="/icons/icon-192.png" />
      </head>
      <body>
        <Navbar />
        <main>{children}</main>
      </body>
    </html>
  );
}
