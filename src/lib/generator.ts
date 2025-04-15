
// This file contains functions to generate captions and hashtags using Google's Gemini API

export interface GeneratorInput {
  description?: string;
  niche?: string;
  keywords?: string;
  hashtagCount: number;
  imageFile?: File | null;
  randomSeed?: string; // Add randomness parameter
  generationCount?: number; // Track generation attempts
}

export interface GeneratorResult {
  caption: string;
  hashtags: string[];
  isLoading: boolean;
}

// Gemini API configuration
const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent";
const GEMINI_API_URL_VISION = "https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent";
const GEMINI_API_KEY = "AIzaSyBqOJt6r_gRahFTOLFsZ-DvAbiJMVNOmCM";

// Function to generate captions and hashtags using Google's Gemini API
export async function generateCaptionAndHashtags(
  input: GeneratorInput
): Promise<{ caption: string; hashtags: string[] }> {
  try {
    if (!GEMINI_API_KEY) {
      console.warn("Gemini API key not provided, using mock data instead");
      return generateMockData(input);
    }

    let apiUrl;
    let requestBody;
    
    if (input.imageFile) {
      // Handle image-based generation
      console.log("Preparing image-based request for Gemini API");
      
      // Convert image to base64
      const base64Image = await fileToDataUrl(input);
      if (!base64Image) {
        console.error("Failed to convert image to base64");
        return generateMockData(input);
      }
      
      // Remove the data URL prefix to get just the base64 content
      const base64Data = base64Image.split(',')[1];
      
      apiUrl = `${GEMINI_API_URL_VISION}?key=${GEMINI_API_KEY}`;
      
      // Construct the prompt for image analysis with more variation instructions
      const promptText = `Analyze this image and generate a completely fresh and unique Instagram caption that best suits it.
                   Create a caption that is very different from standard templates.
                   Be creative, unexpected, and original.
                   Also, provide ${input.hashtagCount} relevant and trending hashtags based on the image content.
                   ${input.keywords ? `Use these keywords if possible: ${input.keywords}` : ""}
                   Ensure the caption is engaging and social media-friendly.
                   
                   Important: Make sure your caption is unique and not repetitive (this is request #${input.generationCount || 1}).
                   Use a distinct writing style and approach from previous generations.
                   
                   Random seed: ${input.randomSeed || Math.random().toString()}
                   
                   Format your response as a JSON object with two fields:
                   1. "caption": A string containing the engaging caption
                   2. "hashtags": An array of strings, each representing a hashtag (including the # symbol)
                   
                   Example response format:
                   {
                     "caption": "Your caption text here",
                     "hashtags": ["#tag1", "#tag2", "#tag3"]
                   }`;
      
      // Construct the request body with higher temperature for more randomness
      requestBody = {
        contents: [
          {
            parts: [
              { text: promptText },
              {
                inline_data: {
                  mime_type: input.imageFile.type,
                  data: base64Data
                }
              }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.9, // Increased from 0.7 for more variety
          maxOutputTokens: 800,
          topP: 0.95, // Adding topP parameter for more diversity
          topK: 40 // Adding topK parameter for more diversity
        }
      };
      
      console.log("Sending image-based request to Gemini API");
    } else {
      // Handle text-based generation
      apiUrl = `${GEMINI_API_URL}?key=${GEMINI_API_KEY}`;
      
      // Construct the prompt for text-based generation with more variation instructions
      const promptText = `Generate a FRESH, UNIQUE, and CREATIVE Instagram caption based on this post description: ${input.description || 'a social media post'}.
                   The post is related to ${input.niche || 'social media'}, so make sure the caption aligns with that.
                   ${input.keywords ? `Use these keywords if possible: ${input.keywords}` : ""}
                   
                   IMPORTANT: This is generation attempt #${input.generationCount || 1}, so your caption must be COMPLETELY DIFFERENT from standard templates or previous generations.
                   Be creative, unexpected, and original - avoid clichés and standard social media language.
                   
                   Random seed: ${input.randomSeed || Math.random().toString()}
                   
                   Also, generate ${input.hashtagCount} relevant and trending hashtags that fit the description and niche.
                   Keep the caption creative, engaging, and suitable for Instagram.
                   
                   Format your response as a JSON object with two fields:
                   1. "caption": A string containing the engaging caption
                   2. "hashtags": An array of strings, each representing a hashtag (including the # symbol)
                   
                   Example response format:
                   {
                     "caption": "Your caption text here",
                     "hashtags": ["#tag1", "#tag2", "#tag3"]
                   }`;
      
      // Construct the request body with higher temperature for more randomness
      requestBody = {
        contents: [
          {
            parts: [
              { text: promptText }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.9, // Increased from 0.7 for more variety
          maxOutputTokens: 800,
          topP: 0.95, // Adding topP parameter for more diversity
          topK: 40 // Adding topK parameter for more diversity
        }
      };
      
      console.log("Sending text-based request to Gemini API");
    }
    
    console.log("API URL:", apiUrl);
    
    // Make the API request
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Gemini API error:", errorData);
      return generateMockData(input);
    }

    const data = await response.json();
    console.log("Gemini API response:", data);
    
    // Extract text content from the response
    const content = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
    console.log("Raw content from API:", content);
    
    try {
      // Try to locate and parse JSON within the response
      let jsonMatch = content.match(/\{[\s\S]*\}/);
      let jsonContent = jsonMatch ? jsonMatch[0] : content;
      
      // Try to parse the JSON response
      const parsedContent = JSON.parse(jsonContent);
      return {
        caption: parsedContent.caption || "Failed to generate caption",
        hashtags: Array.isArray(parsedContent.hashtags) ? parsedContent.hashtags : []
      };
    } catch (parseError) {
      console.error("Error parsing Gemini response:", parseError);
      
      // Fallback content extraction using regex
      let caption = "Error parsing API response";
      let hashtags: string[] = [];
      
      // Try to extract caption using regex
      const captionMatch = content.match(/caption["'\s:]+(.*?)(?=["',$]|hashtags|$)/is);
      if (captionMatch && captionMatch[1]) {
        caption = captionMatch[1].trim().replace(/^["']|["']$/g, '');
      }
      
      // Try to extract hashtags using regex
      const hashtagsMatch = content.match(/hashtags["'\s:]+\[(.*?)\]/is);
      if (hashtagsMatch && hashtagsMatch[1]) {
        const hashtagsContent = hashtagsMatch[1].trim();
        hashtags = hashtagsContent
          .split(/,\s*/)
          .map(tag => tag.trim().replace(/^["']|["']$/g, ''))
          .filter(tag => tag.length > 0)
          .map(tag => tag.startsWith('#') ? tag : `#${tag}`);
      } else {
        // Alternative approach if array format isn't found
        const hashtagsText = content.match(/hashtags["'\s:]+(.+?)(?=[\n}]|caption|$)/is);
        if (hashtagsText && hashtagsText[1]) {
          hashtags = hashtagsText[1]
            .split(/[\s,]+/)
            .filter(tag => tag.trim().length > 0)
            .map(tag => tag.replace(/^["']|["']$/g, ''))
            .map(tag => tag.startsWith('#') ? tag : `#${tag}`);
        }
      }
      
      return { caption, hashtags };
    }
  } catch (error) {
    console.error("Error generating content:", error);
    return generateMockData(input);
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

// Fallback function to generate mock data with more variety
function generateMockData(input: GeneratorInput): { caption: string; hashtags: string[] } {
  // Add generation count to ensure different captions each time
  const generationCount = input.generationCount || 0;
  
  // More varied caption templates
  const defaultCaptions = [
    "✨ Embracing every moment of this beautiful journey. The path may not always be clear, but the adventure is worth it!",
    "🌟 Life is about creating yourself, not finding yourself. Every day is a new opportunity to become a better version of you.",
    "🚀 Taking small steps every day. Progress isn't always visible, but it's happening. Keep going!",
    "🌈 Sometimes the smallest things take up the most room in your heart. Cherishing these little moments.",
    "🔥 The dream is free, but the hustle is sold separately. Working on turning dreams into reality one day at a time.",
    "💭 Not everything you face in life can be changed, but nothing can be changed until you face it.",
    "🌊 Finding beauty in the journey, not just the destination. Each step reveals something new.",
    "💫 The best views come after the hardest climbs. Never stop pushing your limits.",
    "🌱 Growth requires patience. Plant the seeds today for tomorrow's garden.",
    "🎭 Life isn't about finding yourself, it's about creating yourself. Write your own story.",
    "🧩 Every challenge is just a puzzle waiting to be solved. Find the right pieces.",
    "⏱️ Time is the most valuable currency. Spend it on what truly matters.",
    "📸 Capturing this moment not just with my camera, but with my heart.",
    "🌙 Even in darkness, there are stars. Look up and find your light."
  ];
  
  // More varied hashtag options
  const defaultHashtags = [
    "#instagood", "#photooftheday", "#love", "#fashion", "#beautiful", 
    "#happy", "#cute", "#tbt", "#like4like", "#followme", 
    "#picoftheday", "#follow", "#me", "#selfie", "#summer",
    "#art", "#instadaily", "#friends", "#repost", "#nature",
    "#smile", "#style", "#instalike", "#food", "#family",
    "#travel", "#likeforlike", "#fitness", "#igers", "#tagsforlikes",
    "#handmade", "#lifestyle", "#nofilter", "#sustainability", "#wellness",
    "#vibes", "#explore", "#motivation", "#adventure", "#photography",
    "#positivevibes", "#inspire", "#entrepreneur", "#goals", "#mindfulness"
  ];

  // Use generation count to select different caption each time
  const captionIndex = (generationCount % defaultCaptions.length);
  let caption = defaultCaptions[captionIndex];
  
  // If keywords were provided, try to include them in the caption
  if (input.keywords) {
    const keywordsList = input.keywords.split(',').map(k => k.trim());
    if (keywordsList.length > 0) {
      const randomKeyword = keywordsList[Math.floor(Math.random() * keywordsList.length)];
      
      // Different ways to incorporate keywords based on generation count
      const incorporations = [
        ` ${randomKeyword} is truly inspiring!`,
        ` When it comes to ${randomKeyword}, nothing compares.`,
        ` The magic of ${randomKeyword} never ceases to amaze me.`,
        ` Finding joy in ${randomKeyword} every single day.`,
        ` ${randomKeyword} changes everything about how I see the world.`
      ];
      
      const incorporationIndex = generationCount % incorporations.length;
      caption += incorporations[incorporationIndex];
    }
  }

  // Select random hashtags based on count and ensure they're different each time
  const seed = input.randomSeed || generationCount.toString();
  const seedNum = Array.from(seed).reduce((acc, char) => acc + char.charCodeAt(0), 0);
  
  // Create a pseudo-random but deterministic shuffle based on the seed
  const shuffled = [...defaultHashtags].sort((a, b) => {
    const hashA = (a.charCodeAt(0) * seedNum) % 100;
    const hashB = (b.charCodeAt(0) * seedNum) % 100;
    return hashA - hashB;
  });
  
  const hashtags = shuffled.slice(0, input.hashtagCount);

  return {
    caption,
    hashtags,
  };
}
