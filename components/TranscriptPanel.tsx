"use client";

import { useEffect, useRef } from "react";
import Icon from "@/components/Icon";

interface Transcript {
  text: string;
  timestamp: Date;
}

interface TranscriptPanelProps {
  transcripts: Transcript[];
}

export default function TranscriptPanel({ transcripts }: TranscriptPanelProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [transcripts]);

  return (
    <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-5 h-64 flex flex-col">
      <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
        <Icon name="transcript" size={20} className="text-blue-400" />
        Live Transcript
      </h2>
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto space-y-3 pr-2 scrollbar-thin scrollbar-thumb-zinc-700 scrollbar-track-zinc-800"
      >
        {transcripts.length === 0 ? (
          <p className="text-gray-500 text-sm text-center py-8">No transcripts yet...</p>
        ) : (
          transcripts.map((transcript, index) => (
            <div
              key={index}
              className="bg-zinc-800 rounded-lg p-3 border border-zinc-700"
            >
              <p className="text-white text-sm leading-relaxed">{transcript.text}</p>
              <p className="text-gray-500 text-xs mt-2">
                {transcript.timestamp.toLocaleTimeString()}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

