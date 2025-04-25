import React from 'react';
import { Button } from '@/components/ui/button';

interface CallToActionSectionProps {
  title: string;
  description: string;
  primaryButtonText: string;
  primaryButtonIcon?: string;
  secondaryButtonText: string;
  secondaryButtonIcon?: string;
  imageSrc: string;
  imageAlt: string;
  onPrimaryClick?: () => void;
  onSecondaryClick?: () => void;
  className?: string;
}

export const CallToActionSection: React.FC<CallToActionSectionProps> = ({
  title,
  description,
  primaryButtonText,
  primaryButtonIcon = 'fa-download',
  secondaryButtonText,
  secondaryButtonIcon = 'fa-book',
  imageSrc,
  imageAlt,
  onPrimaryClick = () => {},
  onSecondaryClick = () => {},
  className = '',
}) => {
  return (
    <section className={`mb-16 ${className}`}>
      <div className="bg-gradient-to-r from-purple-900/20 via-indigo-900/20 to-purple-900/20 rounded-2xl p-8 border border-purple-800/20">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div>
            <h2 className="text-3xl font-bold mb-4">{title}</h2>
            <p className="text-zinc-400 mb-6">
              {description}
            </p>
            <div className="flex flex-wrap gap-4">
              <Button 
                className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white !rounded-button whitespace-nowrap"
                onClick={onPrimaryClick}
              >
                <i className={`fa-solid ${primaryButtonIcon} mr-2`}></i>
                {primaryButtonText}
              </Button>
              <Button 
                variant="outline" 
                className="border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-white !rounded-button whitespace-nowrap"
                onClick={onSecondaryClick}
              >
                <i className={`fa-solid ${secondaryButtonIcon} mr-2`}></i>
                {secondaryButtonText}
              </Button>
            </div>
          </div>
          <div>
            <img
              src={imageSrc}
              alt={imageAlt}
              className="rounded-lg shadow-2xl shadow-purple-500/10 w-full object-cover object-top"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default CallToActionSection;