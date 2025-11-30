"use client";

import { useRouter } from "next/navigation";
import Icon from "@/components/ui/Icon";

interface MeetingEndedProps {
  message?: string;
}

export default function MeetingEnded({
  message = "The meeting has ended",
}: MeetingEndedProps) {
  const router = useRouter();

  return (
    <div className="h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl border border-gray-200 shadow-2xl p-8 text-center">
        <div className="mb-6 flex justify-center">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center shadow-lg shadow-red-500/20">
            <Icon name="stop" size={40} className="text-white" />
          </div>
        </div>

        <h1 className="text-2xl font-bold text-gray-900 mb-3">Meeting Ended</h1>
        <p className="text-gray-500 mb-8">{message}</p>

        <button
          onClick={() => router.push("/")}
          className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-all duration-200 shadow-lg shadow-blue-600/20 hover:shadow-blue-600/30"
        >
          Return to Home
        </button>
      </div>
    </div>
  );
}
