import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  console.warn("GEMINI_API_KEY is not set in environment variables.");
}

const ai = new GoogleGenAI({ apiKey: apiKey || "" });

export async function detectMediaFromImage(imageBase64: string, mimeType: string = "image/png") {
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not configured");
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
  `;

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
    });

    const text = response.text;
    
    if (!text) {
      throw new Error("No text response from Gemini");
    }

    // Clean up potential markdown formatting if the model ignores the instruction
    const cleanedText = text.replace(/```json/g, "").replace(/```/g, "").trim();
    
    return JSON.parse(cleanedText);
  } catch (error) {
    console.error("Error detecting media with Gemini:", error);
    throw new Error("Failed to analyze image");
  }
}
