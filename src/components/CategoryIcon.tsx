import React from 'react';
import * as LucideIcons from 'lucide-react';

interface CategoryIconProps {
  name: string;
  className?: string;
  size?: number;
  color?: string;
}

export const CategoryIcon: React.FC<CategoryIconProps> = ({ name, className = 'w-5 h-5', size, color }) => {
  // @ts-ignore
  const IconComponent = LucideIcons[name] || LucideIcons.Folder;
  return <IconComponent className={className} size={size} style={color ? { color } : undefined} />;
};
