
// Configuration for Gemini API
const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent";
// Set Gemini API key directly
const GEMINI_API_KEY = "AIzaSyBqOJt6r_gRahFTOLFsZ-DvAbiJMVNOmCM";

export interface GeneratorInput {
  description?: string;
  niche?: string;
  keywords?: string;
  hashtagCount: number;
  imageFile?: File | null;
  randomSeed?: string;
  generationCount?: number;
}

export interface GeneratorResult {
  caption: string;
  hashtags: string[];
  isLoading: boolean;
  error?: string;
}

export async function generateCaptionAndHashtags(
  input: GeneratorInput
): Promise<{ caption: string; hashtags: string[]; error?: string }> {
  try {
    // Create a more dynamic prompt that encourages variety
    const basePrompt = `Generate a COMPLETELY UNIQUE and CREATIVE Instagram caption
      ${input.description ? `about: ${input.description}` : ''}
      ${input.niche ? `in the ${input.niche} niche` : ''}
      ${input.keywords ? `incorporating these keywords if possible: ${input.keywords}` : ''}
      
      IMPORTANT REQUIREMENTS:
      - Make this caption (#${input.generationCount || 1}) COMPLETELY DIFFERENT from previous ones
      - Use fresh, original language and structure
      - Avoid clichés and common social media phrases
      - Make it engaging and authentic
      - Include ${input.hashtagCount} relevant and trending hashtags
      
      Random seed for variety: ${input.randomSeed || Math.random()}
      
      Format response as JSON:
      {
        "caption": "your unique caption here",
        "hashtags": ["#hashtag1", "#hashtag2", ...]
      }`;
    
    const result = await callGeminiAPI(basePrompt);
    return result;
  } catch (error) {
    console.error("Error in caption generation process:", error);
    return {
      caption: "Error generating content. Please try again.",
      hashtags: [],
      error: "Failed to generate content. Please try again."
    };
  }
}

async function callGeminiAPI(prompt: string): Promise<{ caption: string; hashtags: string[]; error?: string }> {
  try {
    console.log("Calling Gemini API...");
    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: prompt
              }
            ]
          }
        ],
        generationConfig: {
          temperature: 1.2,
          maxOutputTokens: 1000
        }
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Gemini API error:", errorText);
      
      return { 
        caption: "Failed to generate content. The AI service is currently unavailable.", 
        hashtags: [], 
        error: `API error: ${response.status}. Please try again later.` 
      };
    }

    const data = await response.json();
    const content = data.candidates?.[0]?.content?.parts?.[0]?.text || "";

    try {
      // Extract JSON from the response
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      const jsonContent = jsonMatch ? jsonMatch[0] : content;
      const parsedContent = JSON.parse(jsonContent);

      return {
        caption: parsedContent.caption || "Failed to generate caption",
        hashtags: Array.isArray(parsedContent.hashtags) ? parsedContent.hashtags : [],
        error: undefined
      };
    } catch (parseError) {
      console.error("Error parsing Gemini response:", parseError);
      
      // If JSON parsing fails, try to extract caption and hashtags using regex
      const captionMatch = content.match(/caption["']?\s*:\s*["']([^"']+)["']/);
      const hashtagsMatch = content.match(/hashtags["']?\s*:\s*\[(.*?)\]/s);
      
      const caption = captionMatch ? captionMatch[1] : "Failed to parse caption";
      const hashtagsStr = hashtagsMatch ? hashtagsMatch[1] : "";
      const hashtags = hashtagsStr.match(/#\w+/g) || [];
      
      return { 
        caption: content.includes("caption") ? caption : content,
        hashtags: hashtags,
        error: "The AI generated a response, but it wasn't in the expected format."
      };
    }
  } catch (error) {
    console.error("Gemini API request failed:", error);
    return { 
      caption: "Failed to connect to the AI service.", 
      hashtags: [], 
      error: "API request failed. Please try again later."
    };
  }
}

// Helper function to convert an image file to base64 data URL
export async function fileToDataUrl(input: GeneratorInput): Promise<string | null> {
  if (!input.imageFile) return null;
  
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(input.imageFile);
  });
}
