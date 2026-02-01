"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Users,
  Sparkles,
  BarChart3,
  Calendar,
  Mic,
  Share2,
  CheckCircle,
  Star,
  Zap,
  Shield,
  Clock,
  TrendingUp,
  Heart,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n";

interface Stat {
  value: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

interface Feature {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  href: string;
  color: string;
}

const stats: Stat[] = [
  { value: "10K+", label: "Active Users", icon: Users },
  { value: "50K+", label: "Rooms Created", icon: TrendingUp },
  { value: "500K+", label: "Votes Cast", icon: Heart },
  { value: "4.9", label: "User Rating", icon: Star },
];

const features: Feature[] = [
  {
    icon: Sparkles,
    title: "AI Recommendations",
    description: "Get smart restaurant suggestions based on your group's preferences and voting history.",
    href: "/ai-recommendations",
    color: "from-purple-500 to-pink-500",
  },
  {
    icon: Users,
    title: "Real-time Voting",
    description: "Create rooms and vote together in real-time. See results update instantly.",
    href: "/rooms",
    color: "from-blue-500 to-cyan-500",
  },
  {
    icon: BarChart3,
    title: "Analytics Dashboard",
    description: "Track voting trends, popular cuisines, and group preferences over time.",
    href: "/analytics",
    color: "from-orange-500 to-red-500",
  },
  {
    icon: Mic,
    title: "Voice Commands",
    description: "Control VoteDine hands-free with voice commands for a seamless experience.",
    href: "/voice-commands",
    color: "from-green-500 to-emerald-500",
  },
  {
    icon: Calendar,
    title: "Calendar Integration",
    description: "Add dining events to your calendar with one click. Never miss a dinner.",
    href: "/calendar",
    color: "from-indigo-500 to-purple-500",
  },
  {
    icon: Share2,
    title: "Easy Sharing",
    description: "Share rooms and results with friends via any platform instantly.",
    href: "/share",
    color: "from-pink-500 to-rose-500",
  },
];

const benefits = [
  { icon: Zap, text: "Lightning fast voting" },
  { icon: Shield, text: "Private and secure rooms" },
  { icon: Clock, text: "Real-time synchronization" },
  { icon: Star, text: "AI-powered suggestions" },
];

export default function Landing() {
  const { t } = useI18n();
  const [mounted, setMounted] = useState(false);
  const [scrollY, setScrollY] = useState(0);
  const heroRef = useRef<HTMLDivElement>(null);
  const featuresRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);

    const handleScroll = () => {
      setScrollY(window.scrollY);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    const observerOptions = {
      threshold: 0.1,
      rootMargin: "0px 0px -100px 0px",
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("animate-fade-in");
        }
      });
    }, observerOptions);

    document.querySelectorAll(".observe-fade").forEach((el) => {
      observer.observe(el);
    });

    return () => observer.disconnect();
  }, [mounted]);

  if (!mounted) return null;

  const parallaxOffset = scrollY * 0.5;

  return (
    <div className="bg-white overflow-hidden">
      {/* Hero Section with Parallax */}
      <section
        ref={heroRef}
        className="relative pt-20 pb-16 lg:pt-28 lg:pb-24 overflow-hidden"
        style={{ transform: `translateY(${parallaxOffset}px)` }}
      >
        {/* Animated background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-orange-50 via-white to-purple-50 opacity-60" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(249,115,22,0.1),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(168,85,247,0.1),transparent_50%)]" />

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            {/* Badge with shimmer effect */}
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-orange-500 to-pink-500 text-white rounded-full text-sm font-medium mb-6 animate-scale-in shadow-lg">
              <Sparkles className="w-4 h-4 animate-pulse" />
              <span>{t("heroBadge")}</span>
            </div>

            {/* Heading with gradient text */}
            <h1 className="font-display text-4xl md:text-5xl lg:text-7xl font-bold text-gray-900 mb-6 leading-tight">
              Where Friends
              <span className="gradient-text block mt-2">Agree on Food</span>
            </h1>

            {/* Subtitle */}
            <p className="text-lg md:text-xl text-gray-600 mb-8 max-w-2xl mx-auto leading-relaxed">
              {t("heroSubtitle")}
            </p>

            {/* CTA Buttons with enhanced hover effects */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
              <Link href="/rooms">
                <Button
                  size="lg"
                  className="group bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 text-white font-semibold px-8 py-6 text-lg rounded-xl shadow-lg hover:shadow-xl interactive-scale"
                >
                  {t("heroPrimaryCta")}
                  <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link href="/ai-recommendations">
                <Button
                  size="lg"
                  variant="outline"
                  className="font-semibold px-8 py-6 text-lg rounded-xl border-2 border-gray-200 hover:border-orange-300 hover:bg-orange-50 interactive-scale"
                >
                  Explore AI Picks
                  <Sparkles className="w-5 h-5 ml-2" />
                </Button>
              </Link>
            </div>

            {/* Benefits with icons */}
            <div className="flex flex-wrap items-center justify-center gap-6">
              {benefits.map((benefit) => (
                <div
                  key={benefit.text}
                  className="flex items-center gap-2 text-gray-600 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full shadow-sm hover:shadow-md transition-shadow"
                >
                  <benefit.icon className="w-4 h-4 text-orange-500" />
                  <span className="text-sm font-medium">{benefit.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Decorative elements */}
        <div className="absolute top-20 left-10 w-20 h-20 bg-orange-200 rounded-full blur-3xl opacity-30 animate-pulse" />
        <div className="absolute bottom-20 right-10 w-32 h-32 bg-purple-200 rounded-full blur-3xl opacity-30 animate-pulse" style={{ animationDelay: "1s" }} />
      </section>

      {/* Stats Section with animated counters */}
      <section className="py-12 border-y border-gray-100 bg-gradient-to-r from-gray-50 to-white observe-fade">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div
                key={stat.label}
                className="text-center group"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="flex justify-center mb-2">
                  <div className="w-12 h-12 bg-gradient-to-br from-orange-100 to-pink-100 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                    <stat.icon className="w-6 h-6 text-orange-600" />
                  </div>
                </div>
                <div className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-1">
                  {stat.value}
                </div>
                <div className="text-sm text-gray-500 font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section with 3D cards */}
      <section ref={featuresRef} className="py-16 lg:py-24 observe-fade">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="font-display text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Everything You Need
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              From AI recommendations to real-time voting, VoteDine has all the tools to make group dining decisions effortless.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <Link
                key={feature.title}
                href={feature.href}
                className="group relative p-6 bg-white border border-gray-100 rounded-2xl card-hover overflow-hidden"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {/* Gradient overlay on hover */}
                <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-5 transition-opacity duration-300`} />

                <div className="relative z-10">
                  <div className={`w-12 h-12 bg-gradient-to-br ${feature.color} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-lg`}>
                    <feature.icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-orange-600 transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    {feature.description}
                  </p>
                </div>

                {/* Arrow indicator */}
                <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                  <ArrowRight className="w-5 h-5 text-orange-500" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16 lg:py-24 bg-gradient-to-b from-gray-50 to-white observe-fade">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="font-display text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              How It Works
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Three simple steps to end the &quot;where should we eat?&quot; debate forever.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {[
              { step: "1", title: "Create a Room", description: "Start a new voting room and invite your friends with a simple link.", color: "from-blue-500 to-cyan-500" },
              { step: "2", title: "Add & Vote", description: "Add restaurant options or get AI suggestions, then vote on your favorites.", color: "from-orange-500 to-pink-500" },
              { step: "3", title: "Decide Together", description: "See real-time results and pick the winner. Add it to your calendar!", color: "from-purple-500 to-indigo-500" },
            ].map((item, index) => (
              <div key={item.step} className="text-center group" style={{ animationDelay: `${index * 150}ms` }}>
                <div className={`w-16 h-16 bg-gradient-to-br ${item.color} text-white rounded-2xl flex items-center justify-center text-2xl font-bold mx-auto mb-4 shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all`}>
                  {item.step}
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {item.title}
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section with gradient background */}
      <section className="py-16 lg:py-24 observe-fade">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto relative overflow-hidden bg-gradient-to-br from-orange-500 via-pink-500 to-purple-600 rounded-3xl p-8 md:p-12 shadow-2xl">
            {/* Animated background pattern */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.8),transparent_50%)]" />
            </div>

            <div className="relative z-10 text-center text-white">
              <h2 className="font-display text-2xl md:text-3xl font-bold mb-4">
                Ready to Simplify Group Dining?
              </h2>
              <p className="text-white/90 mb-8 text-lg">
                Join thousands of groups who&apos;ve ended the restaurant debate with VoteDine.
              </p>
              <Link href="/rooms">
                <Button
                  size="lg"
                  className="bg-white text-orange-600 hover:bg-gray-100 font-semibold px-8 py-6 text-lg rounded-xl shadow-lg hover:shadow-xl interactive-scale"
                >
                  Get Started Free
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
              <div className="mt-6 flex flex-wrap items-center justify-center gap-6 text-white/90 text-sm">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" />
                  <span>No credit card required</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" />
                  <span>Free forever</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" />
                  <span>Cancel anytime</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
