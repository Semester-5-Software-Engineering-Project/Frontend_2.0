/**
 * Date utility functions for consistent date/time generation
 */

/**
 * Get current date and time in local timezone (not UTC)
 * @returns {Object} Object containing date (YYYY-MM-DD) and time (HH:MM:SS) strings
 */
export const getCurrentDateTime = () => {
  const now = new Date();
  
  // Get local date components
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  
  // Get local time components
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');
  
  return {
    date: `${year}-${month}-${day}`,
    time: `${hours}:${minutes}:${seconds}`
  };
};

/**
 * Get current date in local timezone (YYYY-MM-DD format)
 * @returns {string} Date string in YYYY-MM-DD format
 */
export const getCurrentDate = () => {
  return getCurrentDateTime().date;
};

/**
 * Get current time in local timezone (HH:MM:SS format)
 * @returns {string} Time string in HH:MM:SS format
 */
export const getCurrentTime = () => {
  return getCurrentDateTime().time;
};