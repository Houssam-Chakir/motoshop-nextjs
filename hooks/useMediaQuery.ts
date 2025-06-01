import { useState, useEffect, useCallback } from 'react';


export type BreakpointName = 'sm' | 'md' | 'lg' | 'xl' | '2xl';

export const BREAKPOINTS: Record<BreakpointName, string> = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
};

/**
 * A custom React hook that tracks whether the viewport width matches a given breakpoint (min-width).
 * @param breakpointName The name of the breakpoint to check against (e.g., 'sm', 'md').
 * @returns `true` if the viewport width is greater than or equal to the breakpoint's min-width, `false` otherwise.
 */
const useMediaQuery = (breakpointName: BreakpointName): boolean => {
  const [matches, setMatches] = useState<boolean>(false);

  const getQuery = useCallback((): string => {
    // `breakpointName` is type-checked, so `BREAKPOINTS[breakpointName]` will always be a valid string.
    const minWidth = BREAKPOINTS[breakpointName];
    return `(min-width: ${minWidth})`;
  }, [breakpointName]);

  useEffect(() => {
    const query: string = getQuery();
    const media: MediaQueryList = window.matchMedia(query);

    // Function to update state based on media query match
    const updateMatch = (): void => {
      setMatches(media.matches);
    };

    // Perform an initial check for the media query's state
    updateMatch();

    // Add event listener using the modern API
    // Note: The 'change' event listener for MediaQueryList is well-supported.
    media.addEventListener('change', updateMatch);

    // Cleanup function to remove the event listener
    return () => {
      media.removeEventListener('change', updateMatch);
    };
  }, [getQuery]); // Re-run effect if `getQuery` instance changes (i.e., if `breakpointName` changes)

  return matches;
};

export default useMediaQuery;
