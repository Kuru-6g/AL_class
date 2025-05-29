import AsyncStorage from '@react-native-async-storage/async-storage';

const USER_TOKEN_KEY = '@userToken';
const USER_ID_KEY = '@userId';

export const getAuthToken = async (): Promise<string | null> => {
  try {
    const token = await AsyncStorage.getItem(USER_TOKEN_KEY);
    return token;
  } catch (error) {
    console.error('Error getting auth token:', error);
    return null;
  }
};

export const setAuthToken = async (token: string, userId: string): Promise<void> => {
  try {
    await AsyncStorage.multiSet([
      [USER_TOKEN_KEY, token],
      [USER_ID_KEY, userId]
    ]);
  } catch (error) {
    console.error('Error setting auth data:', error);
    throw error;
  }
};

export const getCurrentUserId = async (): Promise<string | null> => {
  try {
    return await AsyncStorage.getItem(USER_ID_KEY);
  } catch (error) {
    console.error('Error getting user ID:', error);
    return null;
  }
};

export const removeAuthToken = async (): Promise<void> => {
  try {
    await AsyncStorage.multiRemove([USER_TOKEN_KEY, USER_ID_KEY]);
  } catch (error) {
    console.error('Error removing auth data:', error);
    throw error;
  }
};

interface EnrolledClass {
  classId: string;
  enrolledAt: string; // ISO date string
}

export const getUserEnrolledClassesKey = (userId: string): string => {
  return `@enrolledClasses_${userId}`;
};

export const isEnrollmentValid = (enrolledAt: string): boolean => {
  try {
    const enrollmentDate = new Date(enrolledAt);
    const expirationDate = new Date(enrollmentDate);
    expirationDate.setDate(expirationDate.getDate() + 30); // Add 30 days
    
    return new Date() <= expirationDate;
  } catch (error) {
    console.error('Error checking enrollment validity:', error);
    return false;
  }
};
