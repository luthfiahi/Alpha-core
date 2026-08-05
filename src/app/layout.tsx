import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { QueryProvider } from "@/providers/QueryProvider";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Project Alpha — AI Trading Coach",
  description:
    "Trade Better. Think Better. Become Better. AI Trading Coach that helps you grow through reflection, data, and structured learning.",
  keywords: [
    "Alpha",
    "Trading Coach",
    "AI",
    "Journal",
    "Reflection",
    "Trading Psychology",
  ],
  icons: {
    icon: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>🧠</text></svg>",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${jetbrainsMono.variable} antialiased bg-[#0B0D17] text-[#F3F4F6]`}
      >
        <QueryProvider>
          {children}
        </QueryProvider>
        <Toaster
          theme="dark"
          position="top-right"
          toastOptions={{
            style: {
              background: "#151827",
              border: "1px solid #232636",
              color: "#F3F4F6",
            },
          }}
        />
      </body>
    </html>
  );
}
