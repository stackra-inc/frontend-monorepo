export type SiteConfig = typeof siteConfig;

export const siteConfig = {
  name: "Pixielity — Next.js",
  description: "Production-ready Next.js monorepo with Config, Logger, and DI Container.",
  navItems: [
    { label: "Home", href: "/" },
    { label: "Config", href: "/config" },
    { label: "Logger", href: "/logger" },
    { label: "Container", href: "/container" },
    { label: "Events", href: "/events" },
    { label: "Docs", href: "/docs" },
  ],
  navMenuItems: [
    { label: "Home", href: "/" },
    { label: "Config", href: "/config" },
    { label: "Logger", href: "/logger" },
    { label: "Container", href: "/container" },
    { label: "Events", href: "/events" },
    { label: "Docs", href: "/docs" },
    { label: "GitHub", href: "https://github.com/pixielity-inc/frontend-monorepo" },
  ],
  links: {
    github: "https://github.com/heroui-inc/heroui",
    twitter: "https://twitter.com/hero_ui",
    docs: "https://heroui.com",
    discord: "https://discord.gg/9b6yyZKmH4",
    sponsor: "https://patreon.com/jrgarciadev",
  },
};
