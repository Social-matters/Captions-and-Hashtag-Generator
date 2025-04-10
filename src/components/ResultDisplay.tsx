
import React from "react";
import { Button } from "@/components/ui/button";
import { Copy, Check } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

interface ResultDisplayProps {
  caption: string;
  hashtags: string[];
}

const ResultDisplay: React.FC<ResultDisplayProps> = ({ caption, hashtags }) => {
  const { toast } = useToast();
  const [captionCopied, setCaptionCopied] = React.useState(false);
  const [hashtagsCopied, setHashtagsCopied] = React.useState(false);

  const handleCopyCaption = () => {
    navigator.clipboard.writeText(caption);
    setCaptionCopied(true);
    toast({
      title: "Caption copied to clipboard!",
      description: "Now you can paste it on Instagram",
    });
    setTimeout(() => setCaptionCopied(false), 2000);
  };

  const handleCopyHashtags = () => {
    navigator.clipboard.writeText(hashtags.join(" "));
    setHashtagsCopied(true);
    toast({
      title: "Hashtags copied to clipboard!",
      description: "Now you can paste them on Instagram",
    });
    setTimeout(() => setHashtagsCopied(false), 2000);
  };

  const handleCopyAll = () => {
    const allContent = `${caption}\n\n${hashtags.join(" ")}`;
    navigator.clipboard.writeText(allContent);
    toast({
      title: "Caption and hashtags copied to clipboard!",
      description: "Now you can paste them on Instagram",
    });
  };

  return (
    <div className="w-full space-y-6 rounded-lg border p-6 shadow-sm">
      <div>
        <div className="mb-2 flex items-center justify-between">
          <h3 className="text-lg font-semibold">Your Caption</h3>
          <Button
            variant="outline"
            size="sm"
            onClick={handleCopyCaption}
            className="h-8"
          >
            {captionCopied ? (
              <Check className="mr-2 h-4 w-4" />
            ) : (
              <Copy className="mr-2 h-4 w-4" />
            )}
            {captionCopied ? "Copied!" : "Copy Caption"}
          </Button>
        </div>
        <div className="rounded-lg bg-gray-50 p-4">
          <p className="whitespace-pre-line">{caption}</p>
        </div>
      </div>

      <div>
        <div className="mb-2 flex items-center justify-between">
          <h3 className="text-lg font-semibold">Your Hashtags</h3>
          <Button
            variant="outline"
            size="sm"
            onClick={handleCopyHashtags}
            className="h-8"
          >
            {hashtagsCopied ? (
              <Check className="mr-2 h-4 w-4" />
            ) : (
              <Copy className="mr-2 h-4 w-4" />
            )}
            {hashtagsCopied ? "Copied!" : "Copy Hashtags"}
          </Button>
        </div>
        <div className="rounded-lg bg-gray-50 p-4">
          <div className="flex flex-wrap">
            {hashtags.map((tag, index) => (
              <span key={index} className="hashtag">
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>

      <Button onClick={handleCopyAll} className="w-full">
        <Copy className="mr-2 h-4 w-4" /> Copy Caption & Hashtags
      </Button>
    </div>
  );
};

export default ResultDisplay;
