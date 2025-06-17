import { API_BASE_URL } from '@/constants/config';
import { getAuthToken, getCurrentUserId } from '@/utils/auth';

interface PaymentDetails {
  userId?: string;
  classIds: string[];
  referenceNumber: string;
  fullName?: string;
  phoneNumber?: string;
  nic?: string;
  district?: string;
  paymentSlip?: {
    uri: string;
    name: string;
    type: string;
  };
  nicFrontImage?: {
    uri: string;
    name: string;
    type: string;
  } | null;
  nicBackImage?: {
    uri: string;
    name: string;
    type: string;
  } | null;
}

export const submitPayment = async (paymentDetails: PaymentDetails): Promise<any> => {
  try {
    const userId = await getCurrentUserId();
    const formData = new FormData();
    
    // Add user ID and class IDs
    formData.append('userId', userId || '');
    formData.append('classIds', paymentDetails.classIds.join(','));
    formData.append('referenceNumber', paymentDetails.referenceNumber);
    
    // Add user details if provided
    if (paymentDetails.fullName) formData.append('fullName', paymentDetails.fullName);
    if (paymentDetails.phoneNumber) formData.append('phoneNumber', paymentDetails.phoneNumber);
    if (paymentDetails.nic) formData.append('nic', paymentDetails.nic);
    if (paymentDetails.district) formData.append('district', paymentDetails.district);
    
    // Add payment slip file
    if (paymentDetails.paymentSlip) {
      // @ts-ignore - React Native's FormData type is different
      formData.append('slipImage', {
        uri: paymentDetails.paymentSlip.uri,
        type: 'image/jpeg',
        name: paymentDetails.paymentSlip.name || 'payment_slip.jpg',
      });
    }
    
    // Add NIC front image if available
    if (paymentDetails.nicFrontImage) {
      // @ts-ignore - React Native's FormData type is different
      formData.append('nicFrontImage', {
        uri: paymentDetails.nicFrontImage.uri,
        type: 'image/jpeg',
        name: paymentDetails.nicFrontImage.name || 'nic_front.jpg',
      });
    }
    
    // Add NIC back image if available
    if (paymentDetails.nicBackImage) {
      // @ts-ignore - React Native's FormData type is different
      formData.append('nicBackImage', {
        uri: paymentDetails.nicBackImage.uri,
        type: 'image/jpeg',
        name: paymentDetails.nicBackImage.name || 'nic_back.jpg',
      });
    }
    
    // Make API request
    const response = await fetch(`http://192.168.8.114:5001/api/payments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      body: formData,
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Failed to submit payment');
    }
    
    return data.data;
  } catch (error) {
    console.error('Payment submission error:', error);
    throw error;
  }
};

export const getPaymentStatus = async (paymentId: string): Promise<any> => {
  try {
    const token = await getAuthToken();
    
    const response = await fetch(`${API_BASE_URL}/payments/${paymentId}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Failed to get payment status');
    }
    
    return data.data;
  } catch (error) {
    console.error('Get payment status error:', error);
    throw error;
  }
};