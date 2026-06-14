import type { Metadata } from "next";
import { SiteShell } from "./site-chrome";
import "./globals.css";

export const metadata: Metadata = {
  title: "Zeno UI Playground",
  description: "Prompt, preview, and export consistent themed component systems with Zeno UI.",
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
    var mode = stored === "dark" || stored === "light" ? stored : "light";
    document.documentElement.dataset.siteMode = mode;
    document.documentElement.style.colorScheme = mode;
  } catch (_) {
    document.documentElement.dataset.siteMode = "light";
    document.documentElement.style.colorScheme = "light";
  }
})();
`;

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>): React.ReactElement {
  return (
    <html lang="en" data-site-mode="light" suppressHydrationWarning>
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
