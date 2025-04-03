
// This file contains mock functions to simulate caption and hashtag generation
// In a real app, these would call an API

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

// Mock function to simulate API call
export async function generateCaptionAndHashtags(
  input: GeneratorInput
): Promise<{ caption: string; hashtags: string[] }> {
  // Simulate API call delay
  await new Promise((resolve) => setTimeout(resolve, 2000));

  // In a real implementation, this would call an AI API
  // For now, we'll use placeholder content
  
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

  // Select a random caption
  const caption = defaultCaptions[Math.floor(Math.random() * defaultCaptions.length)];
  
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
