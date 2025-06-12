export interface GenerateContentParams {
  systemPrompt: string;
  userPrompt: string;
}

export async function generateContent({
  systemPrompt,
  userPrompt,
}: GenerateContentParams): Promise<string> {
  try {
    const response = await fetch("/api/gemini", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ systemPrompt, userPrompt }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `API Error: Status ${response.status}`);
    }

    const data = await response.json();

    if (!data.text) {
      throw new Error("No text content received from API");
    }

    return data.text;
  } catch (error) {
    console.error("Error in generateContent:", error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("An unknown error occurred.");
  }
}

// Function to check API health
export async function checkApiHealth(): Promise<boolean> {
  try {
    const response = await fetch("/api/gemini", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        systemPrompt: "You are a helpful assistant.",
        userPrompt: "Hello",
      }),
    });

    return response.ok;
  } catch (error) {
    console.error("API health check failed:", error);
    return false;
  }
}

// Retry logic for failed requests
export async function generateContentWithRetry(
  params: GenerateContentParams,
  maxRetries = 3,
): Promise<string> {
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await generateContent(params);
    } catch (error) {
      lastError = error as Error;
      console.warn(`Attempt ${attempt} failed:`, error);

      if (error instanceof Error && error.message.includes("401")) {
        break;
      }

      if (attempt < maxRetries) {
        const delay = Math.pow(2, attempt - 1) * 1000;
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }

  throw lastError || new Error("Max retries exceeded");
}
