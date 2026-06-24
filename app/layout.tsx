import type { Metadata } from "next";
import { SiteShell } from "./site-chrome";
import "./globals.css";

export const metadata: Metadata = {
  title: "Zeno UI",
  description: "Authenticate, generate, publish, and initialize cloud-hosted themes for Zeno UI.",
  icons: {
    icon: "/zeno-logo.svg",
    shortcut: "/zeno-logo.svg",
    apple: "/zeno-logo.svg"
  }
};

const themeInitScript = `
(function () {
  try {
    var stored = window.localStorage.getItem("zeno-ui-site-mode");
    var hasChoice = window.localStorage.getItem("zeno-ui-site-mode-choice") === "true";
    var mode = hasChoice && (stored === "dark" || stored === "light") ? stored : "dark";
    document.documentElement.dataset.siteMode = mode;
    document.documentElement.style.colorScheme = mode;
  } catch (_) {
    document.documentElement.dataset.siteMode = "dark";
    document.documentElement.style.colorScheme = "dark";
  }
})();
`;

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>): React.ReactElement {
  return (
    <html lang="en" data-site-mode="dark" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
      </head>
      <body>
        <SiteShell>{children}</SiteShell>
      </body>
    </html>
  );
}
