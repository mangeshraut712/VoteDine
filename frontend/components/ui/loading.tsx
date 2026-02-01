"use client";

import { useEffect, useState } from "react";

interface LoadingSpinnerProps {
    size?: "sm" | "md" | "lg";
    color?: string;
}

export function LoadingSpinner({ size = "md", color = "orange" }: LoadingSpinnerProps) {
    const sizeClasses = {
        sm: "w-4 h-4",
        md: "w-8 h-8",
        lg: "w-12 h-12",
    };

    return (
        <div className="flex items-center justify-center">
            <div
                className={`${sizeClasses[size]} border-4 border-gray-200 border-t-${color}-500 rounded-full animate-spin`}
            />
        </div>
    );
}

export function LoadingSkeleton() {
    return (
        <div className="space-y-4 animate-pulse">
            <div className="h-8 bg-gray-200 rounded-lg w-3/4 skeleton" />
            <div className="h-4 bg-gray-200 rounded w-1/2 skeleton" />
            <div className="grid grid-cols-3 gap-4">
                <div className="h-24 bg-gray-200 rounded-xl skeleton" />
                <div className="h-24 bg-gray-200 rounded-xl skeleton" />
                <div className="h-24 bg-gray-200 rounded-xl skeleton" />
            </div>
        </div>
    );
}

export function PageLoader() {
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        const timer = setInterval(() => {
            setProgress((prev) => {
                if (prev >= 90) return prev;
                return prev + Math.random() * 10;
            });
        }, 200);

        return () => clearInterval(timer);
    }, []);

    return (
        <div className="fixed inset-0 bg-white z-50 flex items-center justify-center">
            <div className="w-full max-w-md px-8">
                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-4 animate-pulse-glow">
                        <svg
                            className="w-8 h-8 text-white"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                            />
                        </svg>
                    </div>
                    <h2 className="font-display text-2xl font-bold text-gray-900 mb-2">
                        VoteDine
                    </h2>
                    <p className="text-gray-600 text-sm">Loading your experience...</p>
                </div>

                {/* Progress Bar */}
                <div className="relative h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                        className="absolute inset-y-0 left-0 bg-gradient-to-r from-orange-500 to-pink-500 rounded-full transition-all duration-300 ease-out"
                        style={{ width: `${progress}%` }}
                    >
                        <div className="absolute inset-0 animate-shimmer" />
                    </div>
                </div>

                <div className="mt-4 text-center text-xs text-gray-500">
                    {progress < 30 && "Initializing..."}
                    {progress >= 30 && progress < 60 && "Loading components..."}
                    {progress >= 60 && progress < 90 && "Almost there..."}
                    {progress >= 90 && "Ready!"}
                </div>
            </div>
        </div>
    );
}

export function CardSkeleton() {
    return (
        <div className="bg-white border border-gray-100 rounded-2xl p-6 space-y-4">
            <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gray-200 rounded-xl skeleton" />
                <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-3/4 skeleton" />
                    <div className="h-3 bg-gray-200 rounded w-1/2 skeleton" />
                </div>
            </div>
            <div className="space-y-2">
                <div className="h-3 bg-gray-200 rounded skeleton" />
                <div className="h-3 bg-gray-200 rounded w-5/6 skeleton" />
            </div>
        </div>
    );
}
