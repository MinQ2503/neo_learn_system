import React from 'react';

interface ClayCardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  interactive?: boolean;
}

const ClayCard: React.FC<ClayCardProps> = ({ children, className = '', onClick, interactive = false }) => {
  return (
    <div
      onClick={onClick}
      className={`
        bg-gray-100 
        rounded-3xl 
        shadow-clay 
        text-gray-800
        ${interactive ? 'cursor-pointer hover:scale-[1.01] transition-transform duration-200 active:shadow-clay-inset' : ''}
        ${className}
      `}
    >
      {children}
    </div>
  );
};

export default ClayCard;
