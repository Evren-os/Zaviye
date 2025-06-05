const API_KEY = process.env.GEMINI_API_KEY || "";
const MODEL_NAME = "gemini-2.5-flash-preview-05-20";
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL_NAME}:generateContent?key=${API_KEY}`;

export interface GenerateContentParams {
  systemPrompt: string;
  userPrompt: string;
}

export async function generateContent({
  systemPrompt,
  userPrompt,
}: GenerateContentParams): Promise<string> {
  if (!API_KEY) {
    throw new Error("GEMINI_API_KEY environment variable is not set");
  }

  try {
    const requestBody = {
      contents: [
        {
          role: "user",
          parts: [{ text: `${systemPrompt}\n\nUser: ${userPrompt}` }],
        },
      ],
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
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    if (
      data.candidates &&
      data.candidates[0] &&
      data.candidates[0].content &&
      data.candidates[0].content.parts
    ) {
      return data.candidates[0].content.parts[0].text || "No response generated.";
    } else {
      throw new Error("Invalid response format from API");
    }
  } catch (error) {
    console.error("Error generating content:", error);
    return "Sorry, I encountered an error while processing your request. Please try again.";
  }
}
