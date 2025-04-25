import React from 'react';
import { Button } from '@/components/ui/button';
import LED from '@/components/ui/led';

interface HeroSectionProps {
  className?: string;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ className = '' }) => {
  return (
    <section className={`mb-16 ${className}`}>
      <div className="flex flex-col md:flex-row items-center">
        <div className="md:w-1/2 mb-8 md:mb-0 md:pr-8">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-indigo-400 to-purple-400">
            Next Generation Audio Synthesis
          </h1>
          <p className="text-xl text-zinc-400 mb-8">
            Experience unparalleled sound design capabilities with our cutting-edge digital synthesizer. Craft sounds from the future, today.
          </p>
          <div className="flex flex-wrap gap-4">
            <Button className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white px-8 py-6 text-lg !rounded-button whitespace-nowrap">
              <i className="fa-solid fa-play mr-2"></i>
              Start Creating
            </Button>
            <Button variant="outline" className="border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-white px-8 py-6 text-lg !rounded-button whitespace-nowrap">
              <i className="fa-solid fa-headphones mr-2"></i>
              Listen to Demos
            </Button>
          </div>
        </div>
        <div className="md:w-1/2">
          <div className="relative">
            <img
              src="https://readdy.ai/api/search-image?query=Futuristic%20professional%20audio%20synthesizer%20with%20glowing%20purple%20and%20green%20LED%20interface%2C%20digital%20display%20screen%2C%20multiple%20control%20knobs%20and%20buttons%2C%20sleek%20metallic%20finish%2C%20high-tech%20music%20production%20equipment%20against%20dark%20background%2C%20photorealistic%20product%20shot&width=600&height=400&seq=1&orientation=landscape"
              alt="ARythm-EMU 2050 Synthesizer"
              className="rounded-lg shadow-2xl shadow-purple-500/10 w-full object-cover object-top"
            />
            <div className="absolute -bottom-4 -right-4 bg-zinc-800 rounded-lg px-4 py-2 shadow-lg">
              <div className="flex items-center space-x-2">
                <LED active={true} color="green" />
                <span className="text-sm font-medium">Available Now</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;