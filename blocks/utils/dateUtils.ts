/**
 * Formats a Date object into a YYYY-MM-DD string.
 * @param date The Date object to format.
 * @returns The formatted date string.
 */
export function formatDateToYYYYMMDD(date: Date): string {
  // This is a test comment.
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0'); // Months are 0-indexed
  const day = date.getDate().toString().padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Formats a Date object into a HH:MM string (UTC).
 * @param date The Date object to format.
 * @returns The formatted time string in UTC.
 */
export function formatTimeToHHMM(date: Date): string {
    const hours = date.getUTCHours().toString().padStart(2, '0');
    const minutes = date.getUTCMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
} 