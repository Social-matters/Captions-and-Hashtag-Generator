
import React from "react";

const Header: React.FC = () => {
  return (
    <header className="w-full pt-6 pb-4">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-2">
            <img 
              src="/lovable-uploads/380c892e-50b6-4ac1-a5fd-f96273a4ea22.png" 
              alt="Social Matters Logo" 
              className="h-16"
            />
          </div>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Generate engaging Instagram captions and trending hashtags in seconds
          </p>
        </div>
      </div>
    </header>
  );
};

export default Header;
