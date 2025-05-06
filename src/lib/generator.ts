
// Configuration for ChatGPT API
const CHATGPT_API_URL = "https://api.openai.com/v1/chat/completions";
// Using an empty default key - we'll require users to provide their own
const DEFAULT_CHATGPT_API_KEY = "";

export interface GeneratorInput {
  description?: string;
  niche?: string;
  keywords?: string;
  hashtagCount: number;
  imageFile?: File | null;
  randomSeed?: string;
  generationCount?: number;
  apiKey?: string;
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

    // Check if API key is provided
    if (!input.apiKey) {
      return {
        caption: "Please provide your OpenAI API key to generate content.",
        hashtags: [],
        error: "API key is required. Please enter your OpenAI API key in the form."
      };
    }
    
    const result = await callChatGPTAPI(basePrompt, input.apiKey);
    return result;
  } catch (error) {
    console.error("Error in caption generation process:", error);
    return {
      caption: "Error generating content. Please try again.",
      hashtags: [],
      error: "Failed to generate content. Please check your API key and try again."
    };
  }
}

async function callChatGPTAPI(prompt: string, apiKey?: string): Promise<{ caption: string; hashtags: string[]; error?: string }> {
  try {
    // Ensure API key is provided
    if (!apiKey) {
      return { 
        caption: "No API key provided", 
        hashtags: [],
        error: "OpenAI API key is required. Please provide a valid key."
      };
    }
    
    console.log("Calling ChatGPT API...");
    const response = await fetch(CHATGPT_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: "gpt-4o-mini", // Using GPT-4o mini for optimal price/performance
        messages: [
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 1.2, // Higher temperature for more creativity
        max_tokens: 1000
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("ChatGPT API error:", errorText);
      
      // Handle specific error codes
      if (response.status === 401) {
        return { 
          caption: "", 
          hashtags: [], 
          error: "Invalid API key. Please check your OpenAI API key and try again."
        };
      }
      
      return { caption: "", hashtags: [], error: `API error: ${response.status}. Please check your API key.` };
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "";

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
      console.error("Error parsing ChatGPT response:", parseError);
      return { 
        caption: content,  // Return raw content if JSON parsing fails
        hashtags: [], 
        error: "The AI generated a response, but it wasn't in the expected format."
      };
    }
  } catch (error) {
    console.error("ChatGPT API request failed:", error);
    return { 
      caption: "", 
      hashtags: [], 
      error: "API request failed. Please try again."
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
