
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
import { AlertCircle, Info, Loader2, Sparkles } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import ImageUploader from "@/components/ImageUploader";
import ResultDisplay from "@/components/ResultDisplay";
import Header from "@/components/Header";
import { 
  fileToDataUrl, 
  generateCaptionAndHashtags, 
  GeneratorInput,
  GeneratorResult 
} from "@/lib/generator";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const Index = () => {
  const [activeTab, setActiveTab] = useState<string>("text");
  const { toast } = useToast();
  
  const [description, setDescription] = useState<string>("");
  const [niche, setNiche] = useState<string>("");
  const [keywords, setKeywords] = useState<string>("");
  const [hashtagCount, setHashtagCount] = useState<number>(10);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [apiKey, setApiKey] = useState<string>("");
  
  const [result, setResult] = useState<GeneratorResult>({
    caption: "",
    hashtags: [],
    isLoading: false
  });
  
  const [showResult, setShowResult] = useState<boolean>(false);
  const [generationCount, setGenerationCount] = useState<number>(0);

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
    setResult({ ...result, isLoading: true, error: undefined });
    setShowResult(false);
    
    try {
      setGenerationCount(prevCount => prevCount + 1);
      
      const input: GeneratorInput = {
        description: activeTab === "text" ? description : undefined,
        niche: activeTab === "text" ? niche : undefined,
        keywords: keywords || undefined,
        hashtagCount: hashtagCount,
        imageFile: activeTab === "image" ? imageFile : null,
        randomSeed: Math.random().toString(),
        generationCount: generationCount,
        apiKey: apiKey.trim() || undefined
      };
      
      const generatedResult = await generateCaptionAndHashtags(input);
      
      if (generatedResult.error) {
        toast({
          title: "Generation Issue",
          description: generatedResult.error,
          variant: "destructive"
        });
      }
      
      setResult({
        caption: generatedResult.caption,
        hashtags: generatedResult.hashtags,
        isLoading: false,
        error: generatedResult.error
      });
      
      setShowResult(true);
    } catch (error) {
      console.error("Error generating content:", error);
      setResult({
        ...result,
        isLoading: false,
        error: "Failed to generate content. Please try again."
      });
      
      toast({
        title: "Generation Failed",
        description: "There was an error generating your caption. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleRegenerate = () => {
    handleGenerate();
  };

  const isTextTabValid = description.trim().length > 0 && niche.trim().length > 0;
  const isImageTabValid = !!imageFile;
  const isGenerateEnabled = (activeTab === "text" && isTextTabValid) || (activeTab === "image" && isImageTabValid);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 pb-16">
        <Card className="max-w-4xl mx-auto bg-card text-card-foreground">
          <CardContent className="p-6">
            {result.error && (
              <Alert variant="destructive" className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Generation Issue</AlertTitle>
                <AlertDescription>
                  {result.error}
                </AlertDescription>
              </Alert>
            )}
            
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
                    <Label htmlFor="apiKey">OpenAI API Key</Label>
                    <Input
                      id="apiKey"
                      type="password"
                      placeholder="Enter your OpenAI API key (starts with sk-)"
                      value={apiKey}
                      onChange={(e) => setApiKey(e.target.value)}
                    />
                    <p className="text-xs text-muted-foreground">
                      Your API key is used securely and not stored on our servers
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="keywords">Keywords (Optional)</Label>
                    <Input
                      id="keywords"
                      placeholder="Enter keywords separated by commas..."
                      value={keywords}
                      onChange={(e) => setKeywords(e.target.value)}
                    />
                    <p className="text-xs text-muted-foreground">
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
                    className="w-full mt-4 bg-gray-600 hover:bg-gray-700 text-white"
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
                    <Loader2 className="h-12 w-12 text-instagram-yellow animate-spin mb-4" />
                    <p className="text-gray-400">Crafting the perfect caption...</p>
                  </div>
                ) : showResult ? (
                  <ResultDisplay 
                    caption={result.caption} 
                    hashtags={result.hashtags}
                    onRegenerate={handleRegenerate}
                    isMockData={false}
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-center">
                    <div className="w-24 h-24 rounded-full instagram-gradient-bg flex items-center justify-center mb-4">
                      <Sparkles className="h-12 w-12 text-white" />
                    </div>
                    <h3 className="text-xl font-semibold mb-2">Your Caption Will Appear Here</h3>
                    <p className="text-gray-400 max-w-xs">
                      Fill in the details and click generate to create your Instagram caption and hashtags
                    </p>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
      
      <footer className="py-6 text-center text-sm text-gray-400">
        <p>© 2025 Social Matters Caption Generator. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default Index;
