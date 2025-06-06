import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Loader2, Sparkles } from "lucide-react";
import ImageUploader from "@/components/ImageUploader";
import ResultDisplay from "@/components/ResultDisplay";
import Header from "@/components/Header";
import { 
  fileToDataUrl, 
  generateCaptionAndHashtags, 
  GeneratorInput,
  GeneratorResult 
} from "@/lib/generator";

const Index = () => {
  const [activeTab, setActiveTab] = useState<string>("text");
  
  // Form inputs
  const [description, setDescription] = useState<string>("");
  const [niche, setNiche] = useState<string>("");
  const [keywords, setKeywords] = useState<string>("");
  const [hashtagCount, setHashtagCount] = useState<number>(10);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  
  // Generation results
  const [result, setResult] = useState<GeneratorResult>({
    caption: "",
    hashtags: [],
    isLoading: false
  });
  
  const [showResult, setShowResult] = useState<boolean>(false);

  const handleImageUpload = async (file: File) => {
    setImageFile(file);
    const input: GeneratorInput = {
      imageFile: file,
      hashtagCount: hashtagCount
    };
    const dataUrl = await fileToDataUrl(input);
    setImagePreview(dataUrl);
    setActiveTab("image");
  };

  const handleImageRemove = () => {
    setImageFile(null);
    setImagePreview(null);
  };

  const handleGenerate = async () => {
    setResult({ ...result, isLoading: true });
    setShowResult(false);
    
    try {
      const input: GeneratorInput = {
        description: activeTab === "text" ? description : undefined,
        niche: activeTab === "text" ? niche : undefined,
        keywords: keywords || undefined,
        hashtagCount: hashtagCount,
        imageFile: activeTab === "image" ? imageFile : null
      };
      
      const generatedResult = await generateCaptionAndHashtags(input);
      
      setResult({
        caption: generatedResult.caption,
        hashtags: generatedResult.hashtags,
        isLoading: false
      });
      
      setShowResult(true);
    } catch (error) {
      console.error("Error generating content:", error);
      setResult({
        ...result,
        isLoading: false
      });
    }
  };

  const isTextTabValid = description.trim().length > 0 && niche.trim().length > 0;
  const isImageTabValid = !!imageFile;
  const isGenerateEnabled = (activeTab === "text" && isTextTabValid) || (activeTab === "image" && isImageTabValid);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Header />
      
      <main className="container mx-auto px-4 pb-16">
        <Card className="max-w-4xl mx-auto">
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row gap-8">
              <div className="w-full lg:w-1/2">
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                  <TabsList className="grid w-full grid-cols-2 mb-6">
                    <TabsTrigger value="text">Text Based</TabsTrigger>
                    <TabsTrigger value="image">Image Based</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="text" className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="description">Post Description</Label>
                      <Textarea
                        id="description"
                        placeholder="Describe what your post is about..."
                        className="resize-none"
                        rows={4}
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="niche">Niche/Industry</Label>
                      <Input
                        id="niche"
                        placeholder="e.g., Fashion, Travel, Food, Fitness, etc."
                        value={niche}
                        onChange={(e) => setNiche(e.target.value)}
                      />
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="image">
                    <div className="space-y-4">
                      <Label>Upload an Image</Label>
                      <ImageUploader 
                        onImageUpload={handleImageUpload}
                        onImageRemove={handleImageRemove}
                        uploadedImage={imagePreview}
                      />
                    </div>
                  </TabsContent>
                </Tabs>
                
                <div className="space-y-4 mt-6">
                  <div className="space-y-2">
                    <Label htmlFor="keywords">Keywords (Optional)</Label>
                    <Input
                      id="keywords"
                      placeholder="Enter keywords separated by commas..."
                      value={keywords}
                      onChange={(e) => setKeywords(e.target.value)}
                    />
                    <p className="text-xs text-gray-500">
                      Add specific words you want to include in your caption and hashtags
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="hashtag-count">Number of Hashtags</Label>
                    <Select 
                      value={hashtagCount.toString()} 
                      onValueChange={(value) => setHashtagCount(parseInt(value))}
                    >
                      <SelectTrigger id="hashtag-count">
                        <SelectValue placeholder="Select number of hashtags" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="5">5 Hashtags</SelectItem>
                        <SelectItem value="10">10 Hashtags</SelectItem>
                        <SelectItem value="20">20 Hashtags</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <Button 
                    className="w-full mt-4 bg-black hover:bg-gray-800 text-white"
                    onClick={handleGenerate} 
                    disabled={!isGenerateEnabled || result.isLoading}
                  >
                    {result.isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Sparkles className="mr-2 h-4 w-4" />
                        Generate Caption & Hashtags
                      </>
                    )}
                  </Button>
                </div>
              </div>
              
              <div className="hidden lg:block">
                <Separator orientation="vertical" />
              </div>
              
              <div className="w-full lg:w-1/2">
                {result.isLoading ? (
                  <div className="flex flex-col items-center justify-center h-full">
                    <Loader2 className="h-12 w-12 text-instagram-purple animate-spin mb-4" />
                    <p className="text-gray-500">Crafting the perfect caption...</p>
                  </div>
                ) : showResult ? (
                  <ResultDisplay caption={result.caption} hashtags={result.hashtags} />
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-center">
                    <div className="w-24 h-24 rounded-full instagram-gradient-bg flex items-center justify-center mb-4">
                      <Sparkles className="h-12 w-12 text-white" />
                    </div>
                    <h3 className="text-xl font-semibold mb-2">Your Caption Will Appear Here</h3>
                    <p className="text-gray-500 max-w-xs">
                      Fill in the details and click generate to create your Instagram caption and hashtags
                    </p>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
      
      <footer className="py-6 text-center text-sm text-gray-500">
        <p>© 2025 Social Matters Caption Generator. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default Index;
