'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

// ── Context ───────────────────────────────────────────────────────────────────
interface AvatarContextValue {
  imageLoaded: boolean;
  imageError: boolean;
  setImageLoaded: (v: boolean) => void;
  setImageError: (v: boolean) => void;
}

const AvatarContext = React.createContext<AvatarContextValue>({
  imageLoaded: false,
  imageError: false,
  setImageLoaded: () => {},
  setImageError: () => {},
});

// ── Root ──────────────────────────────────────────────────────────────────────
const Avatar = React.forwardRef<
  HTMLSpanElement,
  React.HTMLAttributes<HTMLSpanElement>
>(({ className, ...props }, ref) => {
  const [imageLoaded, setImageLoaded] = React.useState(false);
  const [imageError, setImageError] = React.useState(false);

  return (
    <AvatarContext.Provider
      value={{ imageLoaded, imageError, setImageLoaded, setImageError }}
    >
      <span
        ref={ref}
        className={cn(
          'relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full',
          className
        )}
        {...props}
      />
    </AvatarContext.Provider>
  );
});
Avatar.displayName = 'Avatar';

// ── Image ─────────────────────────────────────────────────────────────────────
const AvatarImage = React.forwardRef<
  HTMLImageElement,
  React.ImgHTMLAttributes<HTMLImageElement>
>(({ className, onLoad, onError, src, alt = '', ...props }, ref) => {
  const { imageError, setImageLoaded, setImageError } =
    React.useContext(AvatarContext);

  if (imageError || !src) return null;

  return (
    <img
      ref={ref}
      src={src}
      alt={alt}
      className={cn('aspect-square h-full w-full object-cover', className)}
      onLoad={(e) => {
        setImageLoaded(true);
        onLoad?.(e);
      }}
      onError={(e) => {
        setImageError(true);
        onError?.(e);
      }}
      {...props}
    />
  );
});
AvatarImage.displayName = 'AvatarImage';

// ── Fallback ──────────────────────────────────────────────────────────────────
const AvatarFallback = React.forwardRef<
  HTMLSpanElement,
  React.HTMLAttributes<HTMLSpanElement>
>(({ className, ...props }, ref) => {
  const { imageLoaded, imageError } = React.useContext(AvatarContext);

  // Show fallback only when image failed to load or no image provided
  if (imageLoaded && !imageError) return null;

  return (
    <span
      ref={ref}
      className={cn(
        'flex h-full w-full items-center justify-center rounded-full bg-muted text-sm font-medium uppercase text-muted-foreground',
        className
      )}
      {...props}
    />
  );
});
AvatarFallback.displayName = 'AvatarFallback';

export { Avatar, AvatarImage, AvatarFallback };
