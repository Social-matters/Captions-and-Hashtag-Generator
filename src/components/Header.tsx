
import React from "react";

const Header: React.FC = () => {
  return (
    <header className="w-full pt-6 pb-4">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <div className="inline-block mb-2">
            <div className="relative">
              <div className="absolute inset-0 rounded-full instagram-gradient-bg blur-md opacity-75"></div>
              <h1 className="relative text-3xl md:text-4xl font-bold text-white px-6 py-2 rounded-full instagram-gradient-bg">
                InstaSpark
              </h1>
            </div>
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
