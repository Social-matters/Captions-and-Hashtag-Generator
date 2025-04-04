
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
    let messages = [];
    
    // System message to guide response format
    const systemMessage = {
      role: "system", 
      content: "You are a professional social media content creator specializing in engaging Instagram captions and hashtags. Always respond with valid JSON in the format {\"caption\": \"your caption here\", \"hashtags\": [\"#tag1\", \"#tag2\", ...]}."
    };
    
    if (input.imageFile) {
      // Convert image to base64 for API
      const base64Image = await fileToDataUrl(input.imageFile);
      
      prompt = `Analyze this image and generate a catchy Instagram caption that best suits it.
                Also, provide ${input.hashtagCount} relevant and trending hashtags based on the image content.
                ${input.keywords ? `Use these keywords if possible: ${input.keywords}` : ""}
                Ensure the caption is engaging and social media-friendly.
                
                Return the response in JSON format with 'caption' and 'hashtags' as keys.`;
      
      // For image-based generation using gpt-4o's vision capabilities
      messages = [
        systemMessage,
        {
          role: "user",
          content: [
            { type: "text", text: prompt },
            { type: "image_url", image_url: { url: base64Image } }
          ]
        }
      ];
      
      console.log("Sending image-based request to OpenAI API");
    } else {
      // For text-based generation
      prompt = `Generate an engaging Instagram caption based on this post description: ${input.description}.
                The post is related to ${input.niche}, so make sure the caption aligns with that.
                ${input.keywords ? `Use these keywords if possible: ${input.keywords}` : ""}
                Also, generate ${input.hashtagCount} relevant and trending hashtags that fit the description and niche.
                Keep the caption creative, engaging, and suitable for Instagram.
                
                Return the response in JSON format with 'caption' and 'hashtags' as keys.`;
      
      messages = [
        systemMessage,
        { role: "user", content: prompt }
      ];
      
      console.log("Sending request to OpenAI API with prompt:", prompt);
    }
    
    const response = await fetch(OPENAI_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-4o-mini", // Using a model with vision capabilities
        messages: messages,
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
    console.log("OpenAI API response:", data);
    
    const content = data.choices[0].message.content;
    console.log("Raw content from API:", content);
    
    try {
      // Try to parse the JSON response
      const parsedContent = JSON.parse(content);
      return {
        caption: parsedContent.caption || "Error parsing API response",
        hashtags: Array.isArray(parsedContent.hashtags) ? parsedContent.hashtags : []
      };
    } catch (parseError) {
      console.error("Error parsing OpenAI response:", parseError);
      
      // More robust fallback content extraction
      let caption = "Error parsing API response";
      let hashtags: string[] = [];
      
      // Try to extract caption using regex
      const captionMatch = content.match(/caption["\s:]+(.*?)(?=[",$]|hashtags|$)/is);
      if (captionMatch && captionMatch[1]) {
        caption = captionMatch[1].trim().replace(/^["']|["']$/g, '');
      }
      
      // Try to extract hashtags using regex
      const hashtagsMatch = content.match(/hashtags["\s:]+\[(.*?)\]/is);
      if (hashtagsMatch && hashtagsMatch[1]) {
        const hashtagsContent = hashtagsMatch[1].trim();
        hashtags = hashtagsContent
          .split(/,\s*/)
          .map(tag => tag.trim().replace(/^["']|["']$/g, ''))
          .filter(tag => tag.length > 0)
          .map(tag => tag.startsWith('#') ? tag : `#${tag}`);
      } else {
        // Alternative approach if array format isn't found
        const hashtagsText = content.match(/hashtags["\s:]+(.+?)(?=[\n}]|caption|$)/is);
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
