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
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    if (!data.text) {
      throw new Error("No text content received from API");
    }

    return data.text;
  } catch (error) {
    console.error("Error generating content:", error);

    // Provide more specific error messages based on the error type
    if (error instanceof TypeError && error.message.includes("fetch")) {
      return "Network error: Unable to connect to the AI service. Please check your internet connection and try again.";
    }

    if (error instanceof Error && error.message.includes("HTTP error! status: 401")) {
      return "Authentication error: Invalid API key. Please contact support.";
    }

    if (error instanceof Error && error.message.includes("HTTP error! status: 429")) {
      return "Rate limit exceeded: Too many requests. Please wait a moment and try again.";
    }

    if (error instanceof Error && error.message.includes("HTTP error! status: 500")) {
      return "Server error: The AI service is temporarily unavailable. Please try again in a few moments.";
    }

    return "Sorry, I encountered an error while processing your request. Please try again.";
  }
}

// Optional: Add a function to check API health
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

// Optional: Add retry logic for failed requests
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

      // Don't retry on authentication errors
      if (error instanceof Error && error.message.includes("401")) {
        break;
      }

      // Wait before retrying (exponential backoff)
      if (attempt < maxRetries) {
        const delay = Math.pow(2, attempt - 1) * 1000; // 1s, 2s, 4s
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }

  throw lastError || new Error("Max retries exceeded");
}
