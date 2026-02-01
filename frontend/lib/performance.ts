"use client";

import { useEffect, useState } from "react";

interface PerformanceMetrics {
    fcp?: number; // First Contentful Paint
    lcp?: number; // Largest Contentful Paint
    fid?: number; // First Input Delay
    cls?: number; // Cumulative Layout Shift
    ttfb?: number; // Time to First Byte
}

export function usePerformanceMonitor() {
    const [metrics, setMetrics] = useState<PerformanceMetrics>({});

    useEffect(() => {
        if (typeof window === "undefined") return;

        // Observe Web Vitals
        const observer = new PerformanceObserver((list) => {
            for (const entry of list.getEntries()) {
                if (entry.entryType === "paint" && entry.name === "first-contentful-paint") {
                    setMetrics((prev) => ({ ...prev, fcp: entry.startTime }));
                }

                if (entry.entryType === "largest-contentful-paint") {
                    setMetrics((prev) => ({ ...prev, lcp: entry.startTime }));
                }

                if (entry.entryType === "first-input") {
                    const fidEntry = entry as PerformanceEventTiming;
                    setMetrics((prev) => ({ ...prev, fid: fidEntry.processingStart - fidEntry.startTime }));
                }

                if (entry.entryType === "layout-shift" && !(entry as any).hadRecentInput) {
                    setMetrics((prev) => ({ ...prev, cls: (prev.cls || 0) + (entry as any).value }));
                }
            }
        });

        // Observe different entry types
        try {
            observer.observe({ entryTypes: ["paint", "largest-contentful-paint", "first-input", "layout-shift"] });
        } catch (e) {
            console.warn("Performance Observer not fully supported", e);
        }

        // Get Navigation Timing
        const navTiming = performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming;
        if (navTiming) {
            setMetrics((prev) => ({ ...prev, ttfb: navTiming.responseStart - navTiming.requestStart }));
        }

        return () => observer.disconnect();
    }, []);

    return metrics;
}

export function reportWebVitals(metric: PerformanceMetrics) {
    // Send to analytics
    if (process.env.NODE_ENV === "production") {
        // Example: Send to Google Analytics
        // gtag('event', 'web_vitals', { ...metric });
        console.log("Web Vitals:", metric);
    }
}
