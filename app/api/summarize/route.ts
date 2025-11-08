import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { transcript } = await req.json();

    if (!transcript || typeof transcript !== "string") {
      return NextResponse.json(
        { error: "No transcript provided" },
        { status: 400 }
      );
    }

    // Use OpenRouter API
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
        "HTTP-Referer": process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
        "X-Title": "AI Study Rooms",
      },
      body: JSON.stringify({
        model: "openai/gpt-4o-mini",
        messages: [
          {
            role: "system",
            content:
              "You are a helpful study assistant. Summarize the conversation and extract 3-5 key insights or learning points. Be concise and focus on educational value.",
          },
          {
            role: "user",
            content: `Please summarize this study session transcript and extract key points:\n\n${transcript}`,
          },
        ],
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`OpenRouter API error: ${error}`);
    }

    const data = await response.json();
    const summary = data.choices?.[0]?.message?.content || "Unable to generate summary.";

    return NextResponse.json({ summary });
  } catch (error: any) {
    console.error("Summarization error:", error);
    return NextResponse.json(
      { error: error.message || "Summarization failed" },
      { status: 500 }
    );
  }
}

