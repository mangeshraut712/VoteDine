"use client";

import { useState, useRef, useEffect } from "react";
import { Mic, MicOff, Volume2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionResultList {
  length: number;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
  isFinal: boolean;
  [index: number]: SpeechRecognitionAlternative;
}

interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

interface SpeechRecognitionInterface extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: Event) => void) | null;
  onend: (() => void) | null;
}

const sampleCommands = [
  "Create a new room",
  "Find sushi restaurants",
  "Show analytics",
  "Add to calendar",
];

export default function VoiceAssistant() {
  const [supported, setSupported] = useState(true);
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const recognitionRef = useRef<SpeechRecognitionInterface | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const SpeechRecognitionClass = (
      window as unknown as { SpeechRecognition?: new () => SpeechRecognitionInterface; webkitSpeechRecognition?: new () => SpeechRecognitionInterface }
    ).SpeechRecognition || (window as unknown as { webkitSpeechRecognition?: new () => SpeechRecognitionInterface }).webkitSpeechRecognition;

    if (!SpeechRecognitionClass) {
      setSupported(false);
      return;
    }

    const recognition = new SpeechRecognitionClass();
    recognition.lang = "en-US";
    recognition.interimResults = true;
    recognition.continuous = true;

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      const result = Array.from(event.results)
        .map((item) => item[0]?.transcript ?? "")
        .join(" ");
      setTranscript(result.trim());
    };

    recognition.onerror = () => setListening(false);
    recognition.onend = () => setListening(false);

    recognitionRef.current = recognition;
  }, []);

  const toggleListening = () => {
    if (!recognitionRef.current) return;
    if (listening) {
      recognitionRef.current.stop();
      setListening(false);
    } else {
      setTranscript("");
      recognitionRef.current.start();
      setListening(true);
    }
  };

  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-orange-50 rounded-xl flex items-center justify-center">
          <Mic className="w-5 h-5 text-orange-500" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Voice Assistant</h3>
          <p className="text-sm text-gray-500">
            {!supported
              ? "Not supported in this browser"
              : listening
                ? "Listening..."
                : "Tap to speak a command"}
          </p>
        </div>
      </div>

      {/* Transcript Display */}
      <div className="p-4 bg-gray-50 rounded-xl mb-4 min-h-[60px] flex items-center">
        {transcript ? (
          <div className="flex items-center gap-2">
            <Volume2 className="w-4 h-4 text-orange-500" />
            <span className="text-gray-700">"{transcript}"</span>
          </div>
        ) : (
          <span className="text-gray-400 text-sm">
            Try: "{sampleCommands[0]}"
          </span>
        )}
      </div>

      {/* Controls */}
      <div className="flex items-center gap-3 mb-4">
        <Button
          onClick={toggleListening}
          disabled={!supported}
          className={`flex-1 ${listening
            ? "bg-red-500 hover:bg-red-600"
            : "bg-orange-500 hover:bg-orange-600"
            } text-white rounded-lg`}
        >
          {listening ? (
            <>
              <MicOff className="w-4 h-4 mr-2" />
              Stop Listening
            </>
          ) : (
            <>
              <Mic className="w-4 h-4 mr-2" />
              Start Listening
            </>
          )}
        </Button>
      </div>

      {/* Sample Commands */}
      <div className="flex flex-wrap gap-2">
        {sampleCommands.map((cmd) => (
          <span
            key={cmd}
            className="px-3 py-1.5 bg-gray-50 text-gray-600 text-xs rounded-full"
          >
            {cmd}
          </span>
        ))}
      </div>
    </div>
  );
}
