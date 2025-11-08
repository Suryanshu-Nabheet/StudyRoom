"use client";

import { useEffect, useState } from "react";
import Icon from "@/components/Icon";
import { useRoomStore } from "@/store/roomStore";

interface SummaryCardProps {
  summary: string | null;
}

export default function SummaryCard({ summary }: SummaryCardProps) {
  const { transcripts } = useRoomStore();
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    // Generate summary every minute if there are new transcripts
    if (transcripts.length > 0) {
      // Generate immediately on first transcript
      const generateSummary = async () => {
        const recentTranscripts = transcripts
          .slice(-5)
          .map((t) => t.text)
          .join(" ");

        if (recentTranscripts.trim()) {
          setIsGenerating(true);
          try {
            console.log("🧠 Generating summary from", transcripts.length, "transcripts");
            const response = await fetch("/api/summarize", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({ transcript: recentTranscripts }),
            });

            if (response.ok) {
              const data = await response.json();
              if (data.summary) {
                console.log("✅ Summary generated:", data.summary.substring(0, 50) + "...");
                useRoomStore.getState().setSummary(data.summary);
              } else {
                console.log("⚠️ No summary in response");
              }
            } else {
              const errorText = await response.text();
              console.error("❌ Summary API error:", response.status, errorText);
            }
          } catch (error) {
            console.error("❌ Error generating summary:", error);
          } finally {
            setIsGenerating(false);
          }
        }
      };

      // Generate immediately if we have transcripts
      generateSummary();

      // Then set up interval for periodic updates
      const interval = setInterval(generateSummary, 60000); // Every minute

      return () => clearInterval(interval);
    }
  }, [transcripts]);

  return (
    <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-5">
      <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
        <Icon name="brain" size={20} className="text-blue-400" />
        AI Summary
        {isGenerating && (
          <span className="text-xs text-gray-400 ml-2">
            Generating...
          </span>
        )}
      </h2>
      <div className="min-h-[120px]">
        {summary ? (
          <div className="text-gray-300 text-sm leading-relaxed">
            {summary}
          </div>
        ) : (
          <p className="text-gray-500 text-sm">
            Summary will appear here after some conversation...
          </p>
        )}
      </div>
    </div>
  );
}

