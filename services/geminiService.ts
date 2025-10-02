
import { GoogleGenAI, Modality, GenerateContentResponse } from "@google/genai";

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  throw new Error("API_KEY environment variable is not set.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

export const transformImage = async (base64ImageData: string, mimeType: string, prompt: string): Promise<string | null> => {
  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image-preview',
      contents: {
        parts: [
          {
            inlineData: {
              data: base64ImageData,
              mimeType: mimeType,
            },
          },
          {
            text: prompt,
          },
        ],
      },
      config: {
        responseModalities: [Modality.IMAGE, Modality.TEXT],
      },
    });

    // Find the image part in the response
    for (const part of response.candidates[0].content.parts) {
      if (part.inlineData && part.inlineData.mimeType.startsWith('image/')) {
        return part.inlineData.data;
      }
    }

    // Check for safety ratings or other reasons for no image
    const safetyRatings = response.candidates[0].safetyRatings;
    if (safetyRatings && safetyRatings.some(r => r.probability !== 'NEGLIGIBLE')) {
        const blockedCategories = safetyRatings
            .filter(r => r.probability !== 'NEGLIGIBLE')
            .map(r => r.category)
            .join(', ');
        throw new Error(`Image generation blocked due to safety concerns: ${blockedCategories}.`);
    }
    
    // If no image is found and not blocked, it's an unexpected response
    throw new Error("The API response did not contain an image.");

  } catch (error) {
    console.error("Gemini API Error:", error);
    if (error instanceof Error) {
        throw new Error(`Failed to transform image: ${error.message}`);
    }
    throw new Error("An unknown error occurred while communicating with the Gemini API.");
  }
};
