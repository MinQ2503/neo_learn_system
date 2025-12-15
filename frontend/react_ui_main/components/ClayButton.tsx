import React from 'react';

interface ClayButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'danger' | 'neutral';
}

const ClayButton: React.FC<ClayButtonProps> = ({ children, variant = 'primary', className = '', ...props }) => {
  const baseStyle = "px-6 py-3 rounded-2xl font-semibold transition-all duration-200 active:shadow-clay-inset transform active:scale-95 flex items-center justify-center gap-2";
  
  let colorStyle = "";
  
  switch (variant) {
    case 'primary':
      colorStyle = "bg-primary-500 text-white shadow-[6px_6px_12px_#0284c7,-6px_-6px_12px_#38bdf8] hover:bg-primary-600";
      break;
    case 'danger':
      colorStyle = "bg-red-500 text-white shadow-[6px_6px_12px_#b91c1c,-6px_-6px_12px_#f87171] hover:bg-red-600";
      break;
    case 'neutral':
      colorStyle = "bg-gray-100 text-gray-700 shadow-clay hover:bg-gray-200";
      break;
  }

  return (
    <button className={`${baseStyle} ${colorStyle} ${className}`} {...props}>
      {children}
    </button>
  );
};

export default ClayButton;
