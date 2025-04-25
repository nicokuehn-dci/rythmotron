import React from 'react';
import { Card, CardContent } from '@/components/ui/card';

interface TestimonialCardProps {
  rating: number;
  text: string;
  authorName: string;
  authorRole: string;
  className?: string;
}

export const TestimonialCard: React.FC<TestimonialCardProps> = ({
  rating,
  text,
  authorName,
  authorRole,
  className = '',
}) => {
  // Generate stars based on rating (1-5)
  const renderStars = () => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <i key={`full-${i}`} className="fa-solid fa-star text-yellow-500 mr-1"></i>
      );
    }

    if (hasHalfStar) {
      stars.push(
        <i key="half" className="fa-solid fa-star-half-alt text-yellow-500 mr-1"></i>
      );
    }

    const emptyStars = 5 - stars.length;
    for (let i = 0; i < emptyStars; i++) {
      stars.push(
        <i key={`empty-${i}`} className="fa-regular fa-star text-yellow-500 mr-1"></i>
      );
    }

    return stars;
  };

  return (
    <Card className={`bg-zinc-800/50 border-zinc-700 h-full ${className}`}>
      <CardContent className="pt-6">
        <div className="flex items-center mb-4">
          {renderStars()}
        </div>
        <p className="text-zinc-300 mb-4">{text}</p>
        <div className="flex items-center">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center mr-3">
            <i className="fa-solid fa-user text-white"></i>
          </div>
          <div>
            <div className="font-medium">{authorName}</div>
            <div className="text-xs text-zinc-400">{authorRole}</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default TestimonialCard;