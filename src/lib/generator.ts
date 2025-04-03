
// This file contains functions to generate captions and hashtags using OpenAI's API

export interface GeneratorInput {
  description?: string;
  niche?: string;
  keywords?: string;
  hashtagCount: number;
  imageFile?: File | null;
}

export interface GeneratorResult {
  caption: string;
  hashtags: string[];
  isLoading: boolean;
}

// OpenAI API configuration
const OPENAI_API_URL = "https://api.openai.com/v1/chat/completions";
const OPENAI_API_KEY = "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";

// Function to generate captions and hashtags using OpenAI's ChatGPT API
export async function generateCaptionAndHashtags(
  input: GeneratorInput
): Promise<{ caption: string; hashtags: string[] }> {
  try {
    if (!OPENAI_API_KEY) {
      console.warn("OpenAI API key not provided, using mock data instead");
      return generateMockData(input);
    }

    let prompt = "";
    
    if (input.imageFile) {
      // For image-based generation
      prompt = `Analyze this image and generate a catchy Instagram caption that best suits it.
                Also, provide ${input.hashtagCount} relevant and trending hashtags based on the image content.
                ${input.keywords ? `Use these keywords if possible: ${input.keywords}` : ""}
                Ensure the caption is engaging and social media-friendly.
                
                Return the response in JSON format with 'caption' and 'hashtags' as keys.`;
      
      // Image-based prompts would require using OpenAI's Vision API
      // For now, fallback to mock data for image uploads
      console.log("Image-based generation not yet implemented, using mock data");
      return generateMockData(input);
    } else {
      // For text-based generation
      prompt = `Generate an engaging Instagram caption based on this post description: ${input.description}.
                The post is related to ${input.niche}, so make sure the caption aligns with that.
                ${input.keywords ? `Use these keywords if possible: ${input.keywords}` : ""}
                Also, generate ${input.hashtagCount} relevant and trending hashtags that fit the description and niche.
                Keep the caption creative, engaging, and suitable for Instagram.
                
                Return the response in JSON format with 'caption' and 'hashtags' as keys.`;
      
      const response = await fetch(OPENAI_API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${OPENAI_API_KEY}`
        },
        body: JSON.stringify({
          model: "gpt-4o-mini", // Using a modern OpenAI model
          messages: [
            { role: "system", content: "You are a professional social media content creator specializing in engaging Instagram captions and hashtags." },
            { role: "user", content: prompt }
          ],
          temperature: 0.7,
          max_tokens: 500
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("OpenAI API error:", errorData);
        return generateMockData(input);
      }

      const data = await response.json();
      const content = data.choices[0].message.content;
      
      try {
        // Try to parse the JSON response
        const parsedContent = JSON.parse(content);
        return {
          caption: parsedContent.caption || "Error parsing API response",
          hashtags: parsedContent.hashtags || []
        };
      } catch (parseError) {
        console.error("Error parsing OpenAI response:", parseError);
        
        // Attempt to extract caption and hashtags from text response
        const captionMatch = content.match(/caption[:\s]+(.*?)(?=hashtags|\n\n|$)/i);
        const hashtagsMatch = content.match(/hashtags[:\s]+(.*?)(?=\n\n|$)/i);
        
        const caption = captionMatch ? captionMatch[1].trim() : "Error parsing API response";
        const hashtagsString = hashtagsMatch ? hashtagsMatch[1].trim() : "";
        const hashtags = hashtagsString
          .split(/[\s,]+/)
          .filter(tag => tag.startsWith("#") || tag.length > 0)
          .map(tag => tag.startsWith("#") ? tag : `#${tag}`);
        
        return { caption, hashtags };
      }
    }
  } catch (error) {
    console.error("Error generating content:", error);
    return generateMockData(input);
  }
}

// Fallback function to generate mock data
function generateMockData(input: GeneratorInput): { caption: string; hashtags: string[] } {
  const defaultCaptions = [
    "✨ Embracing every moment of this beautiful journey. The path may not always be clear, but the adventure is worth it!",
    "🌟 Life is about creating yourself, not finding yourself. Every day is a new opportunity to become a better version of you.",
    "🚀 Taking small steps every day. Progress isn't always visible, but it's happening. Keep going!",
    "🌈 Sometimes the smallest things take up the most room in your heart. Cherishing these little moments.",
    "🔥 The dream is free, but the hustle is sold separately. Working on turning dreams into reality one day at a time."
  ];
  
  const defaultHashtags = [
    "#instagood", "#photooftheday", "#love", "#fashion", "#beautiful", 
    "#happy", "#cute", "#tbt", "#like4like", "#followme", 
    "#picoftheday", "#follow", "#me", "#selfie", "#summer",
    "#art", "#instadaily", "#friends", "#repost", "#nature"
  ];

  let caption = defaultCaptions[Math.floor(Math.random() * defaultCaptions.length)];
  
  // If keywords were provided, try to include them in the caption
  if (input.keywords) {
    const keywordsList = input.keywords.split(',').map(k => k.trim());
    if (keywordsList.length > 0) {
      const randomKeyword = keywordsList[Math.floor(Math.random() * keywordsList.length)];
      caption += ` ${randomKeyword} is truly inspiring!`;
    }
  }

  // Select random hashtags based on count
  const shuffled = [...defaultHashtags].sort(() => 0.5 - Math.random());
  const hashtags = shuffled.slice(0, input.hashtagCount);

  return {
    caption,
    hashtags,
  };
}

// Function to generate a data URL from a File
export function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
