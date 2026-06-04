'use client';

import { useState, useEffect } from 'react';

export function useMediaQuery(query: string) {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(query);
    const listener = () => {
      setMatches(media.matches);
    };
    media.addEventListener('change', listener);
    // Set the initial state
    listener();
    return () => media.removeEventListener('change', listener);
  }, [query]);

  return matches;
}
