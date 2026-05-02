"use client";

import { useState, useEffect } from "react";
import { Button, Kbd, Link, TextField, InputGroup, Popover } from "@heroui/react";
import { Link as RouterLink, useLocation, useNavigate } from "react-router-dom";
import { Search, User, LogOut, Heart, Menu, X, ChevronDown } from "lucide-react";
import clsx from "clsx";

import { siteConfig } from "@/config/site";
import { ThemeSwitch } from "@/components/theme-switch";
import { useMenu } from "@stackra/react-router";
import type { MenuItem } from "@stackra/react-router";
import { isAuthenticated, logout, getCurrentUser } from "@/utils/auth";
import { TwitterIcon, GithubIcon, DiscordIcon, Logo } from "@/components/icons";

// ── Desktop Nav Item ───────────────────────────────────────────────────────

/**
 * Renders a single top-level nav item. If the item has children,
 * it renders a Popover dropdown; otherwise a plain link.
 */
function NavItem({
  item,
  isActive,
  selectedKey,
}: {
  item: MenuItem;
  isActive: boolean;
  selectedKey: string;
}) {
  const hasChildren = item.children.length > 0;

  if (!hasChildren) {
    return (
      <li>
        <RouterLink
          className={clsx(
            "text-foreground hover:text-accent transition-colors flex items-center gap-2",
            isActive && "text-accent font-medium",
          )}
          to={item.path}
        >
          {item.icon}
          {item.label}
        </RouterLink>
      </li>
    );
  }

  // Parent item with children — render a dropdown
  const isChildActive = item.children.some((child) => selectedKey === child.path);

  return (
    <li>
      <Popover>
        <Popover.Trigger>
          <button
            className={clsx(
              "text-foreground hover:text-accent transition-colors flex items-center gap-1 cursor-pointer bg-transparent border-none p-0 font-inherit text-inherit",
              (isActive || isChildActive) && "text-accent font-medium",
            )}
          >
            {item.icon}
            {item.label}
            <ChevronDown className="h-3.5 w-3.5" />
          </button>
        </Popover.Trigger>
        <Popover.Content placement="bottom start" className="min-w-[200px] p-0">
          <Popover.Dialog className="p-1">
            <ul className="flex flex-col">
              {item.children.map((child) => {
                const childActive = selectedKey === child.path;
                return (
                  <li key={child.path}>
                    <RouterLink
                      className={clsx(
                        "flex items-center gap-2 rounded-md px-3 py-2 text-sm no-underline transition-colors hover:bg-surface",
                        childActive ? "text-accent font-medium" : "text-foreground",
                      )}
                      to={child.path}
                    >
                      {child.icon}
                      {child.label}
                    </RouterLink>
                  </li>
                );
              })}
            </ul>
          </Popover.Dialog>
        </Popover.Content>
      </Popover>
    </li>
  );
}

// ── Mobile Nav Item ────────────────────────────────────────────────────────

/**
 * Renders a mobile nav item. Items with children are shown as
 * a collapsible section.
 */
function MobileNavItem({
  item,
  selectedKey,
  onNavigate,
}: {
  item: MenuItem;
  selectedKey: string;
  onNavigate: () => void;
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const hasChildren = item.children.length > 0;
  const isActive = selectedKey === item.path;
  const isChildActive = item.children.some((child) => selectedKey === child.path);

  if (!hasChildren) {
    return (
      <li>
        <RouterLink
          className={clsx(
            "py-2 text-lg no-underline flex items-center gap-2",
            isActive ? "text-accent" : "text-foreground",
          )}
          to={item.path}
          onClick={onNavigate}
        >
          {item.icon}
          {item.label}
        </RouterLink>
      </li>
    );
  }

  return (
    <li>
      <button
        className={clsx(
          "py-2 text-lg flex items-center gap-2 w-full bg-transparent border-none p-0 font-inherit text-inherit cursor-pointer",
          isActive || isChildActive ? "text-accent" : "text-foreground",
        )}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        {item.icon}
        {item.label}
        <ChevronDown className={clsx("h-4 w-4 transition-transform", isExpanded && "rotate-180")} />
      </button>
      {isExpanded && (
        <ul className="flex flex-col gap-1 pl-4 mt-1">
          {item.children.map((child) => {
            const childActive = selectedKey === child.path;
            return (
              <li key={child.path}>
                <RouterLink
                  className={clsx(
                    "py-1.5 text-base no-underline flex items-center gap-2",
                    childActive ? "text-accent" : "text-foreground",
                  )}
                  to={child.path}
                  onClick={onNavigate}
                >
                  {child.icon}
                  {child.label}
                </RouterLink>
              </li>
            );
          })}
        </ul>
      )}
    </li>
  );
}

// ── Navbar ──────────────────────────────────────────────────────────────────

export const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [authState, setAuthState] = useState({
    isAuthenticated: isAuthenticated(),
    user: getCurrentUser(),
  });
  const location = useLocation();
  const navigate = useNavigate();

  // Update auth state when location changes (after login/logout)
  useEffect(() => {
    setAuthState({
      isAuthenticated: isAuthenticated(),
      user: getCurrentUser(),
    });
  }, [location]);

  const handleLogout = () => {
    logout();
    setAuthState({
      isAuthenticated: false,
      user: null,
    });
    navigate("/");
  };

  /**
   * Get menu items from router with 'main' variant.
   *
   * Uses menuTree (hierarchical) instead of menuItems (flat) so that
   * routes with `parent` are nested under their parent item.
   */
  const { menuTree, selectedKey } = useMenu({
    variant: "main",
    hideParameterized: true,
  });

  const searchInput = (
    <TextField aria-label="Search" type="search">
      <InputGroup>
        <InputGroup.Prefix>
          <Search className="text-base text-muted pointer-events-none shrink-0" size={16} />
        </InputGroup.Prefix>
        <InputGroup.Input className="text-sm" placeholder="Search..." />
        <InputGroup.Suffix>
          <Kbd className="hidden lg:inline-flex">
            <Kbd.Abbr keyValue="command" />
            <Kbd.Content>K</Kbd.Content>
          </Kbd>
        </InputGroup.Suffix>
      </InputGroup>
    </TextField>
  );

  return (
    <nav className="sticky top-0 z-40 w-full border-b border-separator bg-background/70 backdrop-blur-lg">
      <header className="mx-auto flex h-16 max-w-[1280px] items-center justify-between gap-4 px-6">
        <div className="flex items-center gap-4">
          <RouterLink className="flex items-center gap-1" to="/">
            <Logo />
            <p className="font-bold text-inherit">ACME</p>
          </RouterLink>

          {/* Dynamic navigation from router — uses tree for dropdown submenus */}
          <ul className="hidden lg:flex gap-4 ml-2">
            {menuTree.map((item) => {
              const isActive = location.pathname === item.path || selectedKey === item.path;
              return (
                <NavItem
                  key={item.path}
                  item={item}
                  isActive={isActive}
                  selectedKey={selectedKey}
                />
              );
            })}
          </ul>
        </div>

        <div className="hidden sm:flex items-center gap-2">
          <Link
            aria-label="Twitter"
            href={siteConfig.links.twitter}
            rel="noopener noreferrer"
            target="_blank"
          >
            <TwitterIcon className="text-muted" />
          </Link>
          <Link
            aria-label="Discord"
            href={siteConfig.links.discord}
            rel="noopener noreferrer"
            target="_blank"
          >
            <DiscordIcon className="text-muted" />
          </Link>
          <Link
            aria-label="Github"
            href={siteConfig.links.github}
            rel="noopener noreferrer"
            target="_blank"
          >
            <GithubIcon className="text-muted" />
          </Link>
          <ThemeSwitch />
          <div className="hidden lg:flex">{searchInput}</div>

          {/* Auth Buttons */}
          {authState.isAuthenticated ? (
            <>
              <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-surface">
                <User className="text-accent" size={16} />
                <span className="text-sm">{authState.user?.name}</span>
              </div>
              <Button
                className="text-sm font-normal"
                variant="outline"
                size="sm"
                onPress={handleLogout}
              >
                <LogOut size={16} />
                Logout
              </Button>
            </>
          ) : (
            <Button
              className="text-sm font-normal"
              variant="primary"
              size="sm"
              onPress={() => navigate("/login")}
            >
              <User size={16} />
              Login
            </Button>
          )}

          <div className="hidden md:flex">
            <Button
              className="text-sm font-normal"
              variant="tertiary"
              onPress={() => window.open(siteConfig.links.sponsor, "_blank")}
            >
              <Heart className="text-danger" size={16} />
              Sponsor
            </Button>
          </div>
        </div>

        <div className="flex sm:hidden items-center gap-2">
          <Link
            aria-label="Github"
            href={siteConfig.links.github}
            rel="noopener noreferrer"
            target="_blank"
          >
            <GithubIcon className="text-muted" />
          </Link>
          <ThemeSwitch />
          <button
            aria-expanded={isMenuOpen}
            aria-label="Toggle menu"
            className="p-2"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </header>

      {isMenuOpen && (
        <div className="border-t border-separator sm:hidden">
          <div className="p-4">{searchInput}</div>
          <ul className="flex flex-col gap-2 px-4 pb-4">
            {menuTree.map((item) => (
              <MobileNavItem
                key={item.path}
                item={item}
                selectedKey={selectedKey}
                onNavigate={() => setIsMenuOpen(false)}
              />
            ))}
          </ul>
        </div>
      )}
    </nav>
  );
};
