import React, { useState, useEffect } from 'react';
import { Image as ImageIcon } from 'lucide-react';

interface AccessoryImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  fallbackSrc?: string;
  alt: string;
  className?: string;
}

function getSafeUri(rawSrc?: string): string {
  if (!rawSrc) return '';
  // If it's already an external absolute URL or data URL
  if (rawSrc.startsWith('http://') || rawSrc.startsWith('https://') || rawSrc.startsWith('data:')) {
    return rawSrc;
  }
  try {
    // decode then encode to avoid double encoding while ensuring spaces and special characters are safe
    return encodeURI(decodeURI(rawSrc));
  } catch {
    return rawSrc;
  }
}

export const AccessoryImage: React.FC<AccessoryImageProps> = ({
  src,
  fallbackSrc,
  alt,
  className = '',
  loading = 'lazy',
  ...restProps
}) => {
  const [currentSrc, setCurrentSrc] = useState<string>(() => getSafeUri(src));
  const [hasError, setHasError] = useState<boolean>(false);

  useEffect(() => {
    setCurrentSrc(getSafeUri(src));
    setHasError(false);
  }, [src]);

  const handleError = () => {
    const safeFallback = getSafeUri(fallbackSrc);
    if (safeFallback && currentSrc !== safeFallback) {
      setCurrentSrc(safeFallback);
    } else {
      setHasError(true);
    }
  };

  if (hasError || !currentSrc) {
    return (
      <div className={`flex flex-col items-center justify-center bg-[#EFE8DC] text-[#7B6858] p-2 text-center rounded-lg ${className}`}>
        <ImageIcon className="w-6 h-6 text-[#A6907D] mb-1 opacity-70" />
        <span className="text-[10px] font-medium text-[#6E5D4F] leading-tight">{alt || 'Phụ kiện'}</span>
      </div>
    );
  }

  return (
    <img
      src={currentSrc}
      alt={alt}
      onError={handleError}
      className={className}
      loading={loading}
      {...restProps}
    />
  );
};

export default AccessoryImage;
