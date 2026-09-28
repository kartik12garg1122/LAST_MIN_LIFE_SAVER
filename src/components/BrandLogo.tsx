import React from 'react';

interface BrandLogoProps {
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
  className?: string;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  size = 'md',
  showText = true,
  className = '',
}) => {
  const iconSize = size === 'sm' ? 'w-7 h-7' : size === 'lg' ? 'w-14 h-14' : 'w-10 h-10';
  const textSize = size === 'sm' ? 'text-base' : size === 'lg' ? 'text-2xl' : 'text-xl';

  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      {/* Exact vector replica of Student Life Saver emblem */}
      <svg
        className={`${iconSize} shrink-0 text-[#3525cd]`}
        viewBox="0 0 120 120"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Outer rounded container with cutouts */}
        <path
          d="M38 12C23.6406 12 12 23.6406 12 38V82C12 96.3594 23.6406 108 38 108H82C96.3594 108 108 96.3594 108 82V38C108 23.6406 96.3594 12 82 12H38Z"
          stroke="currentColor"
          strokeWidth="7"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="opacity-0"
        />
        {/* Custom outline shaped like the Life Saver buoy */}
        <rect
          x="12"
          y="12"
          width="96"
          height="96"
          rx="32"
          stroke="currentColor"
          strokeWidth="8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Inner Lifebuoy circle ring and lightning break */}
        <circle
          cx="60"
          cy="60"
          r="26"
          stroke="currentColor"
          strokeWidth="8"
        />
        {/* Lifebuoy straps */}
        <line x1="28" y1="28" x2="42" y2="42" stroke="currentColor" strokeWidth="8" strokeLinecap="round" />
        <line x1="28" y1="92" x2="42" y2="78" stroke="currentColor" strokeWidth="8" strokeLinecap="round" />
        <line x1="92" y1="92" x2="78" y2="78" stroke="currentColor" strokeWidth="8" strokeLinecap="round" />
        
        {/* Lightning bolt inside lifebuoy */}
        <path
          d="M62 26L42 62H58L54 94L82 54H64L72 26H62Z"
          fill="currentColor"
        />
      </svg>

      {showText && (
        <div className="flex flex-col leading-tight font-bold tracking-tight text-[#3525cd]">
          <span className={`${textSize} font-extrabold tracking-tight font-['Geist']`}>
            Student
          </span>
          <span className={`${textSize} font-extrabold tracking-tight font-['Geist'] -mt-1`}>
            Life Saver
          </span>
        </div>
      )}
    </div>
  );
};
