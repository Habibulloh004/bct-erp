import { clsx } from "clsx";
import { twMerge } from "tailwind-merge"

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export function parseMultilingual(text, language) {
  if (!text) return '';
  const translations = text.split('***');
  const index = { en: 0, ru: 1, uz: 2 }[language] || 0;
  return translations[index] || translations[0] || ''; // Fallback to English or empty string
}

export const imageUrl = import.meta.env.VITE_API_URL