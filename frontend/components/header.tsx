"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useI18n, type Locale } from "@/lib/i18n";
import {
  Menu,
  X,
  Search,
  Users,
  BarChart3,
  Sparkles,
  Calendar,
  Mic,
  Share2,
  Globe,
  User,
  LogIn,
  ChevronDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const navLinks = [
  { href: "/rooms", label: "Rooms", icon: Users },
  { href: "/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/ai-recommendations", label: "AI Picks", icon: Sparkles },
  { href: "/calendar", label: "Calendar", icon: Calendar },
  { href: "/voice-commands", label: "Voice", icon: Mic },
  { href: "/share", label: "Share", icon: Share2 },
];

const localeNames: Record<Locale, string> = {
  en: "English",
  es: "Español",
  fr: "Français",
};

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [langMenuOpen, setLangMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const pathname = usePathname();
  const router = useRouter();
  const { locale, setLocale, supportedLocales } = useI18n();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setMobileMenuOpen(false);
    setSearchOpen(false);
  }, [pathname]);

  const isActive = (href: string) => pathname === href;

  const submitSearch = (event: React.FormEvent) => {
    event.preventDefault();
    const query = searchQuery.trim();
    if (!query) return;
    setSearchOpen(false);
    setMobileMenuOpen(false);
    router.push(`/search?q=${encodeURIComponent(query)}`);
  };

  return (
    <header
      className={`sticky top-0 z-50 w-full transition-all duration-300 ${scrolled
          ? "bg-white/95 backdrop-blur-md shadow-md"
          : "bg-white border-b border-gray-100"
        }`}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center gap-2 group relative z-50"
          >
            <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
              <Users className="w-6 h-6 text-white" />
            </div>
            <span className="font-display text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent hidden sm:block">
              VoteDine
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const active = isActive(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${active
                      ? "bg-orange-50 text-orange-600"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                    }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Desktop Actions */}
          <div className="hidden lg:flex items-center gap-3">
            {/* Search */}
            <div className="relative">
              {searchOpen ? (
                <form onSubmit={submitSearch} className="flex items-center gap-2 animate-scale-in" role="search">
                  <Input
                    type="search"
                    name="q"
                    aria-label="Search restaurants"
                    placeholder="Search restaurants..."
                    value={searchQuery}
                    onChange={(event) => setSearchQuery(event.target.value)}
                    className="w-64 pl-10 pr-4 py-2 rounded-lg border-gray-200 focus:border-orange-300"
                    autoFocus
                    onBlur={() => setTimeout(() => setSearchOpen(false), 200)}
                  />
                  <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                </form>
              ) : (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setSearchOpen(true)}
                  aria-label="Search restaurants"
                  aria-expanded={searchOpen}
                  className="text-gray-600 hover:text-gray-900"
                >
                  <Search className="w-5 h-5" />
                </Button>
              )}
            </div>

            {/* Language Selector */}
            <div className="relative">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setLangMenuOpen(!langMenuOpen)}
                aria-haspopup="menu"
                aria-expanded={langMenuOpen}
                aria-label="Choose language"
                className="flex items-center gap-1 text-gray-600 hover:text-gray-900"
              >
                <Globe className="w-4 h-4" />
                <span className="text-sm font-medium">
                  {locale.toUpperCase()}
                </span>
                <ChevronDown className="w-3 h-3" />
              </Button>

              {langMenuOpen && (
                <div role="menu" className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-2 animate-scale-in">
                  {supportedLocales.map((code) => (
                    <button
                      key={code}
                      type="button"
                      role="menuitem"
                      onClick={() => {
                        setLocale(code);
                        setLangMenuOpen(false);
                      }}
                      className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 transition-colors ${locale === code
                          ? "text-orange-600 font-medium"
                          : "text-gray-700"
                        }`}
                    >
                      {localeNames[code]}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Auth Buttons */}
            <Link href="/login">
              <Button
                variant="ghost"
                size="sm"
                className="text-gray-600 hover:text-gray-900"
              >
                <LogIn className="w-4 h-4 mr-2" />
                Sign In
              </Button>
            </Link>

            <Link href="/rooms">
              <Button
                size="sm"
                className="bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 text-white font-semibold shadow-md hover:shadow-lg interactive-scale"
              >
                Create Room
              </Button>
            </Link>

            <Link href="/login" aria-label="Account">
              <Button
                variant="ghost"
                size="sm"
                className="w-10 h-10 rounded-full p-0"
              >
                <div className="w-8 h-8 bg-gradient-to-br from-gray-200 to-gray-300 rounded-full flex items-center justify-center">
                  <User className="w-4 h-4 text-gray-600" />
                </div>
              </Button>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors"
            aria-label="Toggle menu"
            aria-expanded={mobileMenuOpen}
            aria-controls="mobile-navigation"
          >
            {mobileMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div id="mobile-navigation" className="lg:hidden border-t border-gray-100 bg-white animate-slide-up">
          <div className="container mx-auto px-4 py-4">
            <form onSubmit={submitSearch} className="mb-4" role="search">
              <div className="relative">
                <Input
                  type="search"
                  name="q"
                  aria-label="Search restaurants"
                  placeholder="Search restaurants..."
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  className="w-full pl-10 pr-4 py-2 rounded-lg border-gray-200"
                />
                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              </div>
            </form>

            {/* Mobile Navigation */}
            <nav className="space-y-1 mb-4">
              {navLinks.map((link) => {
                const Icon = link.icon;
                const active = isActive(link.href);
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all ${active
                        ? "bg-orange-50 text-orange-600"
                        : "text-gray-600 hover:bg-gray-50"
                      }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{link.label}</span>
                  </Link>
                );
              })}
            </nav>

            {/* Mobile Actions */}
            <div className="space-y-2 pt-4 border-t border-gray-100">
              <Link href="/login" className="block">
                <Button
                  variant="outline"
                  className="w-full justify-center"
                  size="lg"
                >
                  <LogIn className="w-4 h-4 mr-2" />
                  Sign In
                </Button>
              </Link>
              <Link href="/rooms" className="block">
                <Button
                  className="w-full justify-center bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 text-white font-semibold"
                  size="lg"
                >
                  Create Room
                </Button>
              </Link>
            </div>

            {/* Mobile Language Selector */}
            <div className="mt-4 pt-4 border-t border-gray-100">
              <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                <Globe className="w-4 h-4" />
                <span className="font-medium">Language</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {supportedLocales.map((code) => (
                  <button
                    key={code}
                    type="button"
                    onClick={() => setLocale(code)}
                    aria-pressed={locale === code}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${locale === code
                        ? "bg-orange-500 text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                  >
                    {code.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
