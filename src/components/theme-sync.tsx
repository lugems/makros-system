'use client';

import * as React from 'react';
import { useTheme } from 'next-themes';

/**
 * @fileOverview Dynamic Status Bar & Theme Synchronizer.
 * Ensures the Android / Mobile OS status bar, browser header chrome,
 * and navigation bar accurately reflect the active theme (Dark vs Light).
 */
export function ThemeSync() {
  const { resolvedTheme } = useTheme();

  React.useEffect(() => {
    if (typeof window === 'undefined') return;

    // Standard palette colors matching globals.css:
    // Light mode: clean off-white (#f8fafc) matching bg-background
    // Dark mode: ultra-dark navy slate (#050811) matching bg-background
    const themeColor = resolvedTheme === 'dark' ? '#050811' : '#f8fafc';

    // 1. Update or create the standard <meta name="theme-color">
    let metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (!metaThemeColor) {
      metaThemeColor = document.createElement('meta');
      metaThemeColor.setAttribute('name', 'theme-color');
      document.head.appendChild(metaThemeColor);
    }
    metaThemeColor.setAttribute('content', themeColor);

    // 2. Also ensure Apple mobile web app status bar style is aligned
    let metaAppleStatus = document.querySelector('meta[name="apple-mobile-web-app-status-bar-style"]');
    if (!metaAppleStatus) {
      metaAppleStatus = document.createElement('meta');
      metaAppleStatus.setAttribute('name', 'apple-mobile-web-app-status-bar-style');
      document.head.appendChild(metaAppleStatus);
    }
    metaAppleStatus.setAttribute('content', resolvedTheme === 'dark' ? 'black-translucent' : 'default');

    // 3. Update document color scheme for native scrollbars and controls
    document.documentElement.style.colorScheme = resolvedTheme === 'dark' ? 'dark' : 'light';
  }, [resolvedTheme]);

  return null;
}
