import { API_BASE_URL, API_ENDPOINTS } from '@/constants/config';
import { getAuthToken } from '@/utils/auth';

export const getEnrolledClasses = async () => {
  try {
    const token = await getAuthToken();
    const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.CLASSES.MY_CLASSES}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch enrolled classes');
    }

    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error('Error fetching enrolled classes:', error);
    throw error;
  }
};

export const getAllClasses = async () => {
  try {
    const token = await getAuthToken();
    const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.CLASSES.ALL}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch classes');
    }

    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error('Error fetching classes:', error);
    throw error;
  }
};
