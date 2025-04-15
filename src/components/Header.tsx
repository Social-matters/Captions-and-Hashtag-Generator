
import React from "react";

const Header: React.FC = () => {
  return (
    <header className="w-full pt-6 pb-4">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-2">
            <img 
              src="/lovable-uploads/dcee4cb8-c8e6-4f86-8176-8daf455a86bf.png" 
              alt="Social Matters Logo" 
              className="h-20"
            />
          </div>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Generate engaging Instagram captions and trending hashtags in seconds
          </p>
        </div>
      </div>
    </header>
  );
};

export default Header;
