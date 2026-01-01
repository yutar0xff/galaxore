import React, { useEffect } from 'react';
import { ERROR_DISPLAY_DURATION } from '../../constants/game';

interface ErrorBannerProps {
  error: string | null;
  onDismiss?: () => void;
}

export function ErrorBanner({ error, onDismiss }: ErrorBannerProps) {
  useEffect(() => {
    if (error && onDismiss) {
      const timer = setTimeout(() => {
        onDismiss();
      }, ERROR_DISPLAY_DURATION);
      return () => clearTimeout(timer);
    }
  }, [error, onDismiss]);

  if (!error) return null;

  return (
    <div className="bg-red-500 p-2 text-center text-white animate-bounce">
      {error}
    </div>
  );
}
