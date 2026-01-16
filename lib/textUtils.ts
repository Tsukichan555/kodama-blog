/**
 * Truncate text with ellipsis for display purposes (e.g., OGP descriptions)
 * @param text - The text to truncate
 * @param maxLength - Maximum length before truncation (default: 160)
 * @returns Truncated text with "..." appended if needed
 */
export const truncateText = (text: string, maxLength: number = 160): string => {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength - 3) + '...'
}
