"use client";

import { useState } from "react";
import Icon from "@/components/Icon";

interface VoiceAssistantProps {
  text: string;
}

export default function VoiceAssistant({ text }: VoiceAssistantProps) {
  const [isSpeaking, setIsSpeaking] = useState(false);

  const speak = () => {
    if ("speechSynthesis" in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      utterance.pitch = 1;
      utterance.volume = 1;

      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);

      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(utterance);
    } else {
      alert("Your browser doesn't support text-to-speech");
    }
  };

  const stop = () => {
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
  };

  return (
    <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-5">
      <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
        <Icon name="speaker" size={20} className="text-blue-400" />
        Voice Assistant
      </h2>
      <div className="space-y-3">
        <button
          onClick={isSpeaking ? stop : speak}
          className={`w-full font-medium py-3 px-4 rounded-lg transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-zinc-900 ${
            isSpeaking
              ? "bg-red-600 hover:bg-red-700 text-white"
              : "bg-blue-600 hover:bg-blue-700 text-white"
          }`}
        >
          {isSpeaking ? (
            <>
              <Icon name="stop" size={16} className="inline mr-2" />
              Stop
            </>
          ) : (
            <>
              <Icon name="play" size={16} className="inline mr-2" />
              Listen to Summary
            </>
          )}
        </button>
        <p className="text-gray-500 text-xs text-center">
          Click to hear the summary explained aloud
        </p>
      </div>
    </div>
  );
}

