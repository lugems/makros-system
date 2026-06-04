import * as React from 'react';
import { useEffect, useState } from 'react';

interface ClientOnlyProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

/**
 * @fileOverview A wrapper component that ensures its children are only rendered on the client.
 * This is useful for avoiding hydration mismatches with dynamic or browser-specific data.
 */
export function ClientOnly({ children, fallback = null }: ClientOnlyProps) {
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    requestAnimationFrame(() => setHasMounted(true));
  }, []);

  if (!hasMounted) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
