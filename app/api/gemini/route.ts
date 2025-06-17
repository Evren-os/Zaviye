import { NextRequest, NextResponse } from "next/server";

// In-memory store for rate limiting. Resets on cold starts.
const rateLimitStore = new Map<string, { count: number; lastRequest: number }>();
const RATE_LIMIT_WINDOW_MS = 60 * 1000;
const RATE_LIMIT_MAX_REQUESTS = 4; // Max 4 requests per minute from a single IP

const API_KEY = process.env.GEMINI_API_KEY || "";
const MODEL_NAME = "gemini-2.5-flash";
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL_NAME}:generateContent?key=${API_KEY}`;

export async function POST(request: NextRequest) {
  const ip = request.ip ?? request.headers.get("x-forwarded-for") ?? "127.0.0.1";
  const now = Date.now();

  const record = rateLimitStore.get(ip);

  if (record && now - record.lastRequest < RATE_LIMIT_WINDOW_MS) {
    if (record.count >= RATE_LIMIT_MAX_REQUESTS) {
      console.warn(`Rate limit exceeded for IP: ${ip}`);
      return NextResponse.json(
        { error: "Too many requests. Please try again later." },
        { status: 429 },
      );
    }
    rateLimitStore.set(ip, { count: record.count + 1, lastRequest: now });
  } else {
    // Start a new record for the IP or reset the window
    rateLimitStore.set(ip, { count: 1, lastRequest: now });
  }

  if (!API_KEY) {
    return NextResponse.json(
      { error: "GEMINI_API_KEY environment variable is not set" },
      { status: 500 },
    );
  }

  try {
    const { systemPrompt, userPrompt } = await request.json();

    const requestBody = {
      contents: [
        {
          role: "user",
          parts: [{ text: userPrompt }],
        },
      ],
      system_instruction: {
        parts: [{ text: systemPrompt }],
      },
      generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 2048,
      },
    };

    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorBody = await response.json().catch(() => ({ error: "Unknown API error" }));
      console.error("Gemini API Error:", errorBody);
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    if (
      data.candidates &&
      data.candidates[0] &&
      data.candidates[0].content &&
      data.candidates[0].content.parts
    ) {
      return NextResponse.json({
        text: data.candidates[0].content.parts[0].text || "No response generated.",
      });
    } else {
      // Handle cases where the API might block the request for safety reasons
      console.warn("Invalid response format or content blocked by API:", data);
      const blockReason = data.promptFeedback?.blockReason || "safety settings";
      return NextResponse.json({
        text: `My apologies, but the response was blocked due to ${blockReason}. Please try rephrasing your message.`,
      });
    }
  } catch (error) {
    console.error("Error generating content:", error);
    return NextResponse.json({ error: "Failed to generate content" }, { status: 500 });
  }
}
