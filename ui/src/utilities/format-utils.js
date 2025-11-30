/**
 * Methods to format data for display
 */
import { DateTime } from 'luxon';

export const formatDateTime = (isoDate) => {
  if (!isoDate) return ''; // Return an empty string if the date is null or undefined
  try {
    return DateTime.fromISO(isoDate).toFormat('MM/dd/yyyy HH:mm'); // Format to MM/DD/YYYY
  } catch (error) {
    console.error('Error formatting date:', error);
    return ''; // Return an empty string if formatting fails
  }
};

export const formatDate = (isoDate) => {
  if (!isoDate) return ''; // Return an empty string if the date is null or undefined
  try {
    return DateTime.fromISO(isoDate).toFormat('MM/dd/yyyy'); // Format to MM/DD/YYYY
  } catch (error) {
    console.error('Error formatting date:', error);
    return ''; // Return an empty string if formatting fails
  }
};
