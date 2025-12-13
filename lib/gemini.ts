import { GoogleGenAI } from "@google/genai"

const apiKey = process.env.GEMINI_API_KEY

if (!apiKey) {
  console.warn("GEMINI_API_KEY is not set in environment variables.")
}

const ai = new GoogleGenAI({ apiKey: apiKey || "" })

export async function detectMediaFromImage(
  imageBase64: string,
  mimeType: string = "image/png",
) {
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not configured")
  }

  const prompt = `
    Analyze this image and identify if it is from a movie or a TV show.
    If it is a movie, provide the movie title.
    If it is a TV show, provide the TV show title, and if possible, the season and episode number.
    
    Return the result in a JSON format with the following structure:
    {
      "type": "movie" | "tv" | "unknown",
      "title": "Title of the movie or TV show",
      "season": number | null,
      "episode": number | null,
      "confidence": "high" | "medium" | "low",
      "description": "A brief description of why you think it is this media."
    }
    Do not include markdown formatting like \`\`\`json. Just return the raw JSON string.
  `

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-pro",
      contents: [
        {
          role: "user",
          parts: [
            { text: prompt },
            {
              inlineData: {
                data: imageBase64,
                mimeType: mimeType,
              },
            },
          ],
        },
      ],
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: "object",
          properties: {
            type: { type: "string", enum: ["movie", "tv", "unknown"] },
            title: { type: "string" },
            season: { type: "number" },
            episode: { type: "number" },
            confidence: { type: "string", enum: ["high", "medium", "low"] },
            description: { type: "string" },
          },
          required: ["type", "title", "confidence", "description"],
        },
      },
    })

    const text = response.text

    if (!text) {
      throw new Error("No text response from Gemini")
    }

    // Clean up potential markdown formatting if the model ignores the instruction
    const cleanedText = text
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim()

    return JSON.parse(cleanedText)
  } catch (error) {
    console.error("Error detecting media with Gemini:", error)
    throw new Error("Failed to analyze image")
  }
}

export interface MediaContext {
  type: "movie" | "tv"
  title: string
  overview?: string
  genres?: string[]
  cast?: string[]
  releaseDate?: string
  runtime?: string
  voteAverage?: number
}

export async function chatAboutMedia(
  mediaContext: MediaContext,
  userMessage: string,
): Promise<string> {
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not configured")
  }

  const mediaTypeName = mediaContext.type === "movie" ? "movie" : "TV show"

  const contextParts = [
    `Title: ${mediaContext.title}`,
    mediaContext.overview && `Overview: ${mediaContext.overview}`,
    mediaContext.genres?.length && `Genres: ${mediaContext.genres.join(", ")}`,
    mediaContext.cast?.length &&
      `Cast: ${mediaContext.cast.slice(0, 10).join(", ")}`,
    mediaContext.releaseDate && `Release Date: ${mediaContext.releaseDate}`,
    mediaContext.runtime && `Runtime: ${mediaContext.runtime}`,
    mediaContext.voteAverage && `Rating: ${mediaContext.voteAverage}/10`,
  ]
    .filter(Boolean)
    .join("\n")

  const systemPrompt = `You are a helpful and knowledgeable assistant specializing in movies and TV shows. 
You are currently helping a user learn more about the following ${mediaTypeName}:

${contextParts}

Your responses should be:
- Detailed and informative
- Focused on this specific ${mediaTypeName}
- Helpful for someone interested in watching or learning about this content
- Based on publicly available information about this ${mediaTypeName}

If asked about topics unrelated to this ${mediaTypeName} or entertainment in general, politely redirect the conversation back to discussing this ${mediaTypeName}.

If you don't know something specific about this ${mediaTypeName}, be honest about it rather than making up information.`

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: [
        {
          role: "user",
          parts: [
            { text: systemPrompt },
            { text: `User question: ${userMessage}` },
          ],
        },
      ],
    })

    const text = response.text

    if (!text) {
      throw new Error("No text response from Gemini")
    }

    return text.trim()
  } catch (error: any) {
    console.error("Error chatting with Gemini:", error)

    // Check for rate limit errors
    if (
      error?.status === 429 ||
      error?.message?.includes("429") ||
      error?.message?.includes("rate limit")
    ) {
      throw new Error("RATE_LIMIT_EXCEEDED")
    }

    throw new Error("Failed to get AI response")
  }
}
