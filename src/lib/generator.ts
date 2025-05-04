// Configuration for Claude API
const CLAUDE_API_URL = "https://api.anthropic.com/v1/messages";
const CLAUDE_API_KEY = "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";

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
}

export async function generateCaptionAndHashtags(
  input: GeneratorInput
): Promise<{ caption: string; hashtags: string[] }> {
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

    // Prepare the API request for Claude
    const response = await fetch(CLAUDE_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": CLAUDE_API_KEY,
        "anthropic-version": "2023-06-01"
      },
      body: JSON.stringify({
        model: "claude-3-opus-20240229",
        max_tokens: 1000,
        messages: [
          {
            role: "user",
            content: basePrompt
          }
        ],
        temperature: 1.2, // Higher temperature for more creativity
        top_p: 0.95,
      })
    });

    if (!response.ok) {
      console.error("Claude API error:", await response.text());
      return generateMockData(input);
    }

    const data = await response.json();
    const content = data.content?.[0]?.text || "";

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
      console.error("Error parsing Claude response:", parseError);
      return generateMockData(input);
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
