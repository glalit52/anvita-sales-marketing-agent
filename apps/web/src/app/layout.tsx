import type { Metadata, Viewport } from "next";
import { themeInitScript } from "@/components/shell/theme";
import { ToastProvider } from "@/components/ui/toast";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "Anvita", template: "%s · Anvita" },
  description: "Anvita: the AI sales & marketing team that finds, engages, converts and retains customers.",
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#15151c" },
  ],
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body className="min-h-dvh antialiased">
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  );
}
