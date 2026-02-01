"use client";

import Link from "next/link";
import {
  Twitter,
  Github,
  Linkedin,
  Instagram,
  Mail,
  Heart,
} from "lucide-react";

const footerLinks = {
  product: [
    { label: "Create Room", href: "/rooms" },
    { label: "AI Recommendations", href: "/ai-recommendations" },
    { label: "Analytics", href: "/analytics" },
    { label: "Voice Commands", href: "/voice-commands" },
  ],
  features: [
    { label: "Calendar Integration", href: "/calendar" },
    { label: "Social Sharing", href: "/share" },
    { label: "Search Restaurants", href: "/search" },
    { label: "Languages", href: "/languages" },
  ],
  company: [
    { label: "About", href: "/about" },
    { label: "Privacy Policy", href: "/privacy" },
    { label: "Terms of Service", href: "/terms" },
    { label: "Contact", href: "/contact" },
  ],
};

const socialLinks = [
  { icon: Twitter, href: "https://twitter.com", label: "Twitter" },
  { icon: Github, href: "https://github.com", label: "GitHub" },
  { icon: Linkedin, href: "https://linkedin.com", label: "LinkedIn" },
  { icon: Instagram, href: "https://instagram.com", label: "Instagram" },
];

export default function Footer() {
  return (
    <footer className="bg-white border-t border-gray-100">
      <div className="container mx-auto px-4 py-12">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-5">
          {/* Brand Column */}
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">V</span>
              </div>
              <span className="font-display text-xl font-semibold text-gray-900">
                VoteDine
              </span>
            </Link>
            <p className="text-gray-500 text-sm mb-6 max-w-xs">
              The smartest way to decide where to eat with friends. AI-powered recommendations, real-time voting, and seamless planning.
            </p>
            <div className="flex items-center gap-3">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 text-gray-400 hover:text-orange-500 hover:bg-orange-50 rounded-lg transition-colors"
                  aria-label={social.label}
                >
                  <social.icon className="w-5 h-5" />
                </a>
              ))}
            </div>
          </div>

          {/* Product Links */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-4">Product</h3>
            <ul className="space-y-3">
              {footerLinks.product.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-gray-500 hover:text-orange-500 transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Features Links */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-4">Features</h3>
            <ul className="space-y-3">
              {footerLinks.features.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-gray-500 hover:text-orange-500 transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company Links */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-4">Company</h3>
            <ul className="space-y-3">
              {footerLinks.company.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-gray-500 hover:text-orange-500 transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-gray-400">
            © {new Date().getFullYear()} VoteDine. All rights reserved.
          </p>
          <p className="text-sm text-gray-400 flex items-center gap-1">
            Made with <Heart className="w-4 h-4 text-red-400 fill-red-400" /> for food lovers
          </p>
          <a
            href="mailto:hello@votedine.com"
            className="text-sm text-gray-500 hover:text-orange-500 flex items-center gap-2 transition-colors"
          >
            <Mail className="w-4 h-4" />
            hello@votedine.com
          </a>
        </div>
      </div>
    </footer>
  );
}
