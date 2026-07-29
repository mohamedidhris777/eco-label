/**
 * EcoLabel X — Footer Component
 */
import Link from "next/link";
import { APP_NAME } from "@/lib/constants";

const FOOTER_LINKS = {
  Platform: [
    { label: "Overview",   href: "#" },
    { label: "Features",   href: "#" },
    { label: "Pricing",    href: "#" },
    { label: "Roadmap",    href: "#" },
  ],
  Solutions: [
    { label: "For Brands",     href: "#" },
    { label: "For Retailers",  href: "#" },
    { label: "For Auditors",   href: "#" },
    { label: "For Consumers",  href: "#" },
  ],
  Resources: [
    { label: "Documentation",  href: "#" },
    { label: "API Reference",  href: "#" },
    { label: "Blog",           href: "#" },
    { label: "Case Studies",   href: "#" },
  ],
  Company: [
    { label: "About",          href: "#" },
    { label: "Careers",        href: "#" },
    { label: "Contact",        href: "#" },
    { label: "Privacy Policy", href: "#" },
  ],
} as const;

export function Footer() {
  return (
    <footer className="border-t border-[rgba(255,255,255,0.07)] bg-[rgba(5,10,24,0.5)] backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">

        {/* Top Grid */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-10 mb-12">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#00ffaa] to-[#00c8ff] flex items-center justify-center">
                <span className="text-[#050a18] font-display font-bold text-sm">E</span>
              </div>
              <span className="font-display font-bold text-white">{APP_NAME}</span>
            </div>
            <p className="text-sm text-slate-500 leading-relaxed max-w-[200px]">
              Intelligent sustainability intelligence for the modern supply chain.
            </p>
          </div>

          {/* Links */}
          {Object.entries(FOOTER_LINKS).map(([group, links]) => (
            <div key={group}>
              <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-4">
                {group}
              </h4>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-slate-500 hover:text-[#00ffaa] transition-colors duration-200"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-8 border-t border-[rgba(255,255,255,0.06)]">
          <p className="text-xs text-slate-600">
            © {new Date().getFullYear()} {APP_NAME}. All rights reserved.
          </p>
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-[#00ffaa] animate-beacon" />
            <span className="text-xs text-slate-600">All systems operational</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
