import React, { useState, useEffect } from 'react';
import { ImageIcon } from 'lucide-react';
import { getCostumeImageCandidates } from '../../utils/costumeImage';

export interface CostumeImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src?: string;
  alt?: string;
  className?: string;
  placeholderClassName?: string;
  showPlaceholderText?: boolean;
}

export const CostumeImage: React.FC<CostumeImageProps> = ({
  src = '',
  alt = 'Trang phục truyền thống',
  className = '',
  placeholderClassName = '',
  showPlaceholderText = true,
  loading = 'lazy',
  ...restProps
}) => {
  const candidates = getCostumeImageCandidates(src);
  const [candidateIndex, setCandidateIndex] = useState<number>(0);
  const [hasFailedAll, setHasFailedAll] = useState<boolean>(false);

  useEffect(() => {
    setCandidateIndex(0);
    setHasFailedAll(candidates.length === 0);
  }, [src]);

  const rawSrc = candidates[candidateIndex] || '';
  const currentSrc = rawSrc
    ? (rawSrc.startsWith('data:') || rawSrc.startsWith('blob:') || rawSrc.startsWith('http')
        ? rawSrc
        : encodeURI(decodeURI(rawSrc)))
    : '';

  const handleError = () => {
    if (candidateIndex + 1 < candidates.length) {
      setCandidateIndex((prev) => prev + 1);
    } else {
      setHasFailedAll(true);
    }
  };

  if (hasFailedAll || !currentSrc) {
    return (
      <div
        className={`flex flex-col items-center justify-center bg-[#EFE8DC] text-[#7B6858] p-4 text-center select-none ${className} ${placeholderClassName}`}
        role="img"
        aria-label={alt || 'Chưa có ảnh'}
      >
        <ImageIcon className="w-8 h-8 sm:w-10 sm:h-10 text-[#A6907D] mb-1.5 opacity-85" strokeWidth={1.5} />
        {showPlaceholderText && (
          <span className="text-xs sm:text-sm font-medium tracking-wide text-[#6E5D4F]">
            Chưa có ảnh
          </span>
        )}
      </div>
    );
  }

  return (
    <img
      src={currentSrc}
      alt={alt}
      className={className}
      loading={loading}
      onError={handleError}
      {...restProps}
    />
  );
};
