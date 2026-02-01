"use client";

import { Share2, Copy, Twitter, Facebook, Mail, Link2, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

const shareOptions = [
  { icon: Twitter, label: "Twitter", color: "text-blue-400" },
  { icon: Facebook, label: "Facebook", color: "text-blue-600" },
  { icon: Mail, label: "Email", color: "text-gray-600" },
  { icon: Link2, label: "Copy Link", color: "text-gray-600" },
];

export default function ShareActions() {
  const [copied, setCopied] = useState(false);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = (platform: string) => {
    const url = encodeURIComponent(window.location.href);
    const text = encodeURIComponent("Check out VoteDine - the smartest way to decide where to eat!");

    const shareUrls: Record<string, string> = {
      Twitter: `https://twitter.com/intent/tweet?url=${url}&text=${text}`,
      Facebook: `https://www.facebook.com/sharer/sharer.php?u=${url}`,
      Email: `mailto:?subject=Check out VoteDine&body=${text}%20${url}`,
    };

    if (platform === "Copy Link") {
      handleCopyLink();
    } else if (shareUrls[platform]) {
      window.open(shareUrls[platform], "_blank");
    }
  };

  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center">
          <Share2 className="w-5 h-5 text-green-500" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Share</h3>
          <p className="text-sm text-gray-500">Invite friends to vote</p>
        </div>
      </div>

      {/* Share Buttons */}
      <div className="grid grid-cols-2 gap-3">
        {shareOptions.map((option) => (
          <Button
            key={option.label}
            variant="outline"
            onClick={() => handleShare(option.label)}
            className="flex items-center justify-center gap-2 py-3 rounded-xl hover:bg-gray-50"
          >
            {option.label === "Copy Link" && copied ? (
              <>
                <Check className="w-4 h-4 text-green-500" />
                <span className="text-sm">Copied!</span>
              </>
            ) : (
              <>
                <option.icon className={`w-4 h-4 ${option.color}`} />
                <span className="text-sm">{option.label}</span>
              </>
            )}
          </Button>
        ))}
      </div>

      {/* Quick Copy */}
      <div className="mt-4 p-3 bg-gray-50 rounded-xl flex items-center gap-2">
        <input
          type="text"
          value={typeof window !== "undefined" ? window.location.href : ""}
          readOnly
          className="flex-1 bg-transparent text-sm text-gray-600 outline-none truncate"
        />
        <Button
          size="sm"
          variant="ghost"
          onClick={handleCopyLink}
          className="shrink-0"
        >
          {copied ? (
            <Check className="w-4 h-4 text-green-500" />
          ) : (
            <Copy className="w-4 h-4" />
          )}
        </Button>
      </div>
    </div>
  );
}
