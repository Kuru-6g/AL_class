import { API_BASE_URL } from '@/constants/config';
import { getAuthToken } from '@/utils/auth';

interface UpdateProfileData {
  fullName?: string;
  email?: string;
  phoneNumber?: string;
  district?: string;
  nic?: string;
  nicFrontImage?: string | null;
  nicBackImage?: string | null;
}

type UpdatePasswordData = {
  currentPassword: string;
  newPassword: string;
};

export const getUserProfile = async (): Promise<any> => {
  const token = await getAuthToken();
  
  const response = await fetch(`${API_BASE_URL}/users/me`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.message || 'Failed to fetch user profile');
  }
  
  return data.data;
};

const uploadImage = async (uri: string): Promise<string> => {
  const token = await getAuthToken();
  const formData = new FormData();
  
  // @ts-ignore - React Native's FormData type is different
  formData.append('image', {
    uri,
    type: 'image/jpeg',
    name: 'upload.jpg',
  });

  const response = await fetch(`${API_BASE_URL}/upload`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'multipart/form-data',
    },
    body: formData,
  });

  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.message || 'Failed to upload image');
  }
  
  return data.url;
};

export const updateProfile = async (profileData: UpdateProfileData): Promise<any> => {
  const token = await getAuthToken();
  const dataToSend = { ...profileData };

  try {
    // Upload new images if they're local URIs
    if (profileData.nicFrontImage && profileData.nicFrontImage.startsWith('file:')) {
      dataToSend.nicFrontImage = await uploadImage(profileData.nicFrontImage);
    }
    
    if (profileData.nicBackImage && profileData.nicBackImage.startsWith('file:')) {
      dataToSend.nicBackImage = await uploadImage(profileData.nicBackImage);
    }

    const response = await fetch(`${API_BASE_URL}/users/update-profile`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(dataToSend),
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Failed to update profile');
    }
    
    return data.data;
  } catch (error) {
    console.error('Update profile error:', error);
    throw error;
  }
};

export const updatePassword = async (passwordData: UpdatePasswordData): Promise<void> => {
  const token = await getAuthToken();
  
  const response = await fetch(`${API_BASE_URL}/users/update-password`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(passwordData),
  });

  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.message || 'Failed to update password');
  }
  
  return data.data;
};

export const deleteAccount = async (): Promise<void> => {
  const token = await getAuthToken();
  
  const response = await fetch(`${API_BASE_URL}/users/delete-account`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.message || 'Failed to delete account');
  }
};
