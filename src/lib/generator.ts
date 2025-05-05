// Configuration for ChatGPT API
const CHATGPT_API_URL = "https://api.openai.com/v1/chat/completions";
const CHATGPT_API_KEY = "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";

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

    // Try ChatGPT API
    const result = await callChatGPTAPI(basePrompt);
    
    // If API fails, use mock data as last resort
    if (result.error) {
      console.log("ChatGPT API failed, using mock data");
      return {
        ...generateMockData(input),
        error: "API service unavailable. Using sample content for demonstration."
      };
    }
    
    return result;
  } catch (error) {
    console.error("Error in caption generation process:", error);
    return {
      ...generateMockData(input),
      error: "Unexpected error occurred. Using sample content for demonstration."
    };
  }
}

async function callChatGPTAPI(prompt: string): Promise<{ caption: string; hashtags: string[]; error?: string }> {
  try {
    console.log("Calling ChatGPT API...");
    const response = await fetch(CHATGPT_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${CHATGPT_API_KEY}`
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
      return { caption: "", hashtags: [], error: `ChatGPT API: ${errorText}` };
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
        hashtags: Array.isArray(parsedContent.hashtags) ? parsedContent.hashtags : []
      };
    } catch (parseError) {
      console.error("Error parsing ChatGPT response:", parseError);
      return { caption: "", hashtags: [], error: "Failed to parse ChatGPT response" };
    }
  } catch (error) {
    console.error("ChatGPT API request failed:", error);
    return { caption: "", hashtags: [], error: "ChatGPT API request failed" };
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
