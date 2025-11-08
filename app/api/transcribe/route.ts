import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("audio") as Blob;

    if (!file) {
      return NextResponse.json(
        { error: "No audio file provided" },
        { status: 400 }
      );
    }

    // Convert Blob to File for FormData
    const audioFile = new File([file], "audio.webm", { type: "audio/webm" });
    const uploadFormData = new FormData();
    uploadFormData.append("file", audioFile);
    uploadFormData.append("model", "openai/whisper-1");

    // Try OpenRouter endpoint first, fallback to OpenAI if needed
    // OpenRouter may proxy OpenAI endpoints
    let response = await fetch("https://openrouter.ai/api/v1/audio/transcriptions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "HTTP-Referer": process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
        "X-Title": "AI Study Rooms",
      },
      body: uploadFormData,
    });

    // Fallback to OpenAI API if OpenRouter doesn't support audio transcription
    if (!response.ok) {
      response = await fetch("https://api.openai.com/v1/audio/transcriptions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
        },
        body: uploadFormData,
      });
    }

    if (!response.ok) {
      const error = await response.text();
      console.error("OpenRouter transcription error:", error);
      throw new Error(`Transcription failed: ${error}`);
    }

    const data = await response.json();
    return NextResponse.json({ text: data.text || "" });
  } catch (error: any) {
    console.error("Transcription error:", error);
    return NextResponse.json(
      { error: error.message || "Transcription failed" },
      { status: 500 }
    );
  }
}

