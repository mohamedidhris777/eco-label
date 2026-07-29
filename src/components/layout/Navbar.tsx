/**
 * EcoLabel X — Navbar Component
 * Glassmorphism top navigation bar.
 */
"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils/cn";
import { ROUTES, MAIN_NAV, APP_NAME } from "@/lib/constants";
import { Button } from "@/components/ui/Button";

export function Navbar() {
  const [scrolled,     setScrolled]     = useState(false);
  const [mobileOpen,   setMobileOpen]   = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  return (
    <header
      className={cn(
        "fixed top-0 inset-x-0 z-50 transition-all duration-300",
        scrolled
          ? "bg-[rgba(5,10,24,0.85)] backdrop-blur-2xl border-b border-[rgba(255,255,255,0.07)] shadow-[0_8px_32px_rgba(0,0,0,0.4)]"
          : "bg-transparent"
      )}
    >
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <Link href={ROUTES.home} className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#00ffaa] to-[#00c8ff] flex items-center justify-center shadow-[0_0_16px_rgba(0,255,170,0.4)] group-hover:shadow-[0_0_24px_rgba(0,255,170,0.6)] transition-all duration-300">
              <span className="text-[#050a18] font-display font-bold text-sm">E</span>
            </div>
            <span className="font-display font-bold text-lg text-white">
              {APP_NAME}
            </span>
          </Link>

          {/* Desktop Nav Links */}
          <ul className="hidden md:flex items-center gap-1">
            {MAIN_NAV.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="px-4 py-2 text-sm text-slate-400 hover:text-white rounded-lg hover:bg-[rgba(255,255,255,0.06)] transition-all duration-200"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>

          {/* Desktop CTA */}
          <div className="hidden md:flex items-center gap-3">
            <Link href={ROUTES.login}>
              <Button variant="ghost" size="sm">Sign In</Button>
            </Link>
            <Link href={ROUTES.register}>
              <Button variant="primary" size="sm">Get Started</Button>
            </Link>
          </div>

          {/* Mobile Toggle */}
          <button
            className="md:hidden p-2 text-slate-400 hover:text-white rounded-lg hover:bg-[rgba(255,255,255,0.06)] transition-colors"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle navigation menu"
            aria-expanded={mobileOpen}
          >
            <span className="sr-only">Menu</span>
            <div className="w-5 flex flex-col gap-1">
              <span className={cn("block h-0.5 bg-current transition-all duration-300", mobileOpen && "rotate-45 translate-y-1.5")} />
              <span className={cn("block h-0.5 bg-current transition-all duration-300", mobileOpen && "opacity-0")} />
              <span className={cn("block h-0.5 bg-current transition-all duration-300", mobileOpen && "-rotate-45 -translate-y-1.5")} />
            </div>
          </button>
        </div>

        {/* Mobile Menu */}
        <div
          className={cn(
            "md:hidden overflow-hidden transition-all duration-300",
            mobileOpen ? "max-h-80 opacity-100 pb-4" : "max-h-0 opacity-0"
          )}
        >
          <ul className="flex flex-col gap-1 pt-2">
            {MAIN_NAV.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className="block px-4 py-2.5 text-sm text-slate-400 hover:text-white rounded-xl hover:bg-[rgba(255,255,255,0.06)] transition-all duration-200"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
          <div className="flex flex-col gap-2 mt-4 pt-4 border-t border-[rgba(255,255,255,0.07)]">
            <Link href={ROUTES.login} onClick={() => setMobileOpen(false)}>
              <Button variant="ghost" size="sm" fullWidth>Sign In</Button>
            </Link>
            <Link href={ROUTES.register} onClick={() => setMobileOpen(false)}>
              <Button variant="primary" size="sm" fullWidth>Get Started</Button>
            </Link>
          </div>
        </div>
      </nav>
    </header>
  );
}
