import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface FeatureCardProps {
  title: string;
  description: string;
  icon: string;
  className?: string;
}

export const FeatureCard: React.FC<FeatureCardProps> = ({
  title,
  description,
  icon,
  className = '',
}) => {
  return (
    <Card className={`bg-zinc-800/50 border-zinc-700 ${className}`}>
      <CardHeader>
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500/20 to-indigo-500/20 flex items-center justify-center mb-4">
          <i className={`${icon} text-purple-400 text-xl`}></i>
        </div>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-zinc-400">{description}</p>
      </CardContent>
    </Card>
  );
};

export default FeatureCard;