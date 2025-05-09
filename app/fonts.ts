// app/fonts.ts or lib/fonts.ts
import { Inter, Oxanium } from 'next/font/google';

export const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter', // CSS variable name
  display: 'swap',         // Ensures text remains visible during font loading
});

export const oxanium = Oxanium({
  subsets: ['latin'],
  weight: ['400', '700'], // Specify weights you need
  variable: '--font-oxanium', // CSS variable name
  display: 'swap',
});
