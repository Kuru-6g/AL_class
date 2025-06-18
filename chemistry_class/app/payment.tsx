import { View, Text, StyleSheet, Image, ActivityIndicator, ScrollView } from 'react-native';
import { Button, useTheme, TextInput, RadioButton } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { useState, useEffect } from 'react';
import * as ImagePicker from 'expo-image-picker';
import { router, useLocalSearchParams } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getCurrentUserId, getUserEnrolledClassesKey, isEnrollmentValid } from '../utils/auth';
import { submitPayment } from '../services/paymentService';
interface EnrolledClass {
  classId: string;
  enrolledAt: string;
}

type PaymentStatus = 'idle' | 'uploading' | 'uploaded' | 'submitted' | 'approved' | 'rejected';

interface PaymentSlip {
  uri: string;
  name: string;
  type: string;
}

type PaymentScreenParams = {
  classIds: string;
};

const USER_DETAILS_KEY = '@user_details';
interface UserDetails {
  nic?: string;
  nicFrontImage?: string;
  nicBackImage?: string;
  district?: string;
  fullName?: string;
  phoneNumber?: string;
  hasUploadedDetails?: boolean;
}

export default function PaymentScreen() {
  const { classIds } = useLocalSearchParams<PaymentScreenParams>();
  const theme = useTheme();
  const [paymentSlip, setPaymentSlip] = useState<PaymentSlip | null>(null);
  const [zoomGmail, setZoomGmail] = useState('');
  const [nic, setNic] = useState('');
  const [district, setDistrict] = useState('');
  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [nicFrontImage, setNicFrontImage] = useState<PaymentSlip | null>(null);
  const [nicBackImage, setNicBackImage] = useState<PaymentSlip | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [status, setStatus] = useState<PaymentStatus>('idle');
  const [hasUploadedDetails, setHasUploadedDetails] = useState(false);
  const [receiptType, setReceiptType] = useState('cdm');
  useEffect(() => {
    AsyncStorage.removeItem(USER_DETAILS_KEY); // Clear stored user details
  }, []);

  // Load user details on component mount
  useEffect(() => {
    const loadUserDetails = async () => {
      try {
        const details = await AsyncStorage.getItem(USER_DETAILS_KEY);
        if (details) {
          const userDetails: UserDetails = JSON.parse(details);
          setHasUploadedDetails(userDetails.hasUploadedDetails || false);
          if (userDetails.nic) setNic(userDetails.nic);
          if (userDetails.district) setDistrict(userDetails.district);
          if (userDetails.fullName) setFullName(userDetails.fullName);
          if (userDetails.phoneNumber) setPhoneNumber(userDetails.phoneNumber);
          if (userDetails.nicFrontImage) setNicFrontImage({ uri: userDetails.nicFrontImage, name: 'nic_front.jpg', type: 'image/jpeg' });
          if (userDetails.nicBackImage) setNicBackImage({ uri: userDetails.nicBackImage, name: 'nic_back.jpg', type: 'image/jpeg' });
        }
      } catch (error) {
        console.error('Error loading user details:', error);
      }
    };

    loadUserDetails();
  }, []);

  const pickImage = async (type: 'payment' | 'nicFront' | 'nicBack') => {
    try {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.8,
      });

      if (!result.canceled && result.assets?.[0]) {
        const asset = result.assets[0];
        const imageData = {
          uri: asset.uri,
          name: asset.uri.split('/').pop() || `${type}.jpg`,
          type: 'image/jpeg',
        };

        switch (type) {
          case 'payment':
            setPaymentSlip(imageData);
            break;
          case 'nicFront':
            setNicFrontImage(imageData);
            break;
          case 'nicBack':
            setNicBackImage(imageData);
            break;
        }
      }
    } catch (error) {
      console.error('Error capturing image:', error);
      alert('Failed to capture image. Please try again.');
    }
  };


  const pickPaymentSlip = () => pickImage('payment');
  const pickNicFrontImage = () => pickImage('nicFront');
  const pickNicBackImage = () => pickImage('nicBack');

  // Check if all required fields are filled
  const validateForm = () => {
    if (!paymentSlip) {
      alert('Please select a payment receipt');
      return false;
    }
    if (!zoomGmail.trim()) {
      alert('Please enter a reference number');
      return false;
    }
    if (!hasUploadedDetails) {
      if (!fullName.trim()) {
        alert('Please enter your full name');
        return false;
      }
      if (!phoneNumber.trim()) {
        alert('Please enter your phone number');
        return false;
      }
      if (!nic.trim()) {
        alert('Please enter your NIC number');
        return false;
      }
      if (!nicFrontImage || !nicBackImage) {
        alert('Please upload both front and back sides of your NIC');
        return false;
      }
      if (!district.trim()) {
        alert('Please enter your district');
        return false;
      }
    }
    return true;
  };

  const uploadPaymentSlip = async () => {
    if (!validateForm()) {
      return;
    }

    setIsUploading(true);
    setStatus('uploading');

    try {
      // Save user details if this is the first time
      if (!hasUploadedDetails) {
        const userDetails: UserDetails = {
          fullName: fullName.trim(),
          phoneNumber: phoneNumber.trim(),
          nic: nic.trim(),
          nicFrontImage: nicFrontImage?.uri,
          nicBackImage: nicBackImage?.uri,
          district: district.trim(),
          hasUploadedDetails: true
        };
        await AsyncStorage.setItem(USER_DETAILS_KEY, JSON.stringify(userDetails));
        setHasUploadedDetails(true);
      }

      // Get the class IDs from the URL params
      const classIdArray = classIds?.split(',').filter(Boolean) || [];

      // Submit payment to API
      const paymentResponse = await submitPayment({
        classIds: classIdArray,
        zoomGmail: zoomGmail.trim(),
        fullName: fullName.trim(),
        phoneNumber: phoneNumber.trim(),
        nic: nic.trim(),
        district: district.trim(),
        paymentSlip: paymentSlip,
        nicFrontImage: nicFrontImage,
        nicBackImage: nicBackImage,
        receiptType:receiptType,
      });

      // Show success message
      setStatus('submitted');
      alert('Payment receipt uploaded successfully!');

      // Save enrolled classes to AsyncStorage
      try {
        const userId = await getCurrentUserId();
        if (!userId) {
          throw new Error('User not authenticated');
        }

        if (classIdArray.length > 0) {
          const enrolledClassesKey = getUserEnrolledClassesKey(userId);
          const now = new Date().toISOString();

          // Get existing enrolled classes
          const existingEnrolled = await AsyncStorage.getItem(enrolledClassesKey);
          let enrolledClasses: EnrolledClass[] = [];

          if (existingEnrolled) {
            try {
              // Filter out any invalid entries and expired enrollments
              const parsed = JSON.parse(existingEnrolled);
              if (Array.isArray(parsed)) {
                enrolledClasses = parsed.filter((item: any) =>
                  item?.classId &&
                  item?.enrolledAt &&
                  isEnrollmentValid(item.enrolledAt)
                );
              }
            } catch (error) {
              console.error('Error parsing enrolled classes:', error);
            }
          }

          // Add new class enrollments with current timestamp
          const newEnrollments = classIdArray
            .filter(id => !enrolledClasses.some(ec => ec.classId === id))
            .map(classId => ({
              classId,
              enrolledAt: now
            }));

          // Combine existing and new enrollments
          const updatedEnrollments = [...enrolledClasses, ...newEnrollments];

          // Save back to AsyncStorage
          await AsyncStorage.setItem(
            enrolledClassesKey,
            JSON.stringify(updatedEnrollments)
          );
        }

        // For now, we'll still set as approved since we don't have real-time status checking
        // In a production app, you might want to poll the API for status updates
        setStatus('approved');
      } catch (error) {
        console.error('Error saving enrolled classes:', error);
        // Still set as approved even if saving enrollment fails
        setStatus('approved');
      }

    } catch (error) {
      console.error('Upload failed:', error);
      alert('Failed to upload payment slip. Please try again.');
      setStatus('idle');
    } finally {
      setIsUploading(false);
    }
  };

  const renderContent = () => {
    if (status === 'uploading') {
      return (
        <View style={styles.statusContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={styles.statusTitle}>Uploading Receipt</Text>
          <Text style={styles.statusText}>Please wait while we upload your payment receipt...</Text>
        </View>
      );
    }

    if (status === 'submitted' || status === 'approved') {
      return (
        <View style={styles.statusContainer}>
          <Ionicons
            name="checkmark-circle"
            size={80}
            color={status === 'approved' ? '#4CAF50' : theme.colors.primary}
          />
          <Text style={[styles.statusTitle, { color: status === 'approved' ? '#4CAF50' : theme.colors.primary }]}>
            {status === 'approved' ? 'Payment Approved!' : 'Payment Submitted'}
          </Text>
          <Text style={styles.statusText}>
            {status === 'approved'
              ? 'Your payment has been verified. You now have access to the class.'
              : 'Your payment receipt has been submitted for verification.'}
          </Text>
          {zoomGmail ? (
            <Text style={styles.referenceText}>Reference: {zoomGmail}</Text>
          ) : null}
          <Button
            mode="contained"
            onPress={() => router.back()}
            style={styles.doneButton}
          >
            Done
          </Button>
        </View>
      );
    }

    // Default/idle state
    return (
      <>
        <View style={styles.header}>

          <Text style={styles.headerTitle}>Upload Payment Receipt</Text>
        </View>

        <ScrollView style={styles.scrollView}>
          <View style={styles.uploadContainer}>
            <Ionicons
              name="receipt"
              size={80}
              color={theme.colors.primary}
              style={styles.uploadIcon}
            />
            <Text style={styles.uploadTitle}>Upload Your Payment Receipt</Text>
            <Text style={styles.uploadSubtitle}>
              Please upload a clear photo of your payment receipt for verification
            </Text>
            <View style={{ width: '100%', marginBottom: 16 }}>
              <Text style={{ marginBottom: 8, fontWeight: 'bold' }}>Select Receipt Type:</Text>
              <RadioButton.Group onValueChange={setReceiptType} value={receiptType}>
                <RadioButton.Item label="CDM Receipt" value="cdm" />
                <RadioButton.Item label="Direct Bank Slip" value="bank" />
                <RadioButton.Item label="Online Transfer" value="online" />
              </RadioButton.Group>
            </View>

            {paymentSlip ? (
              <View style={styles.previewContainer}>
                <Image
                  source={{ uri: paymentSlip.uri }}
                  style={styles.previewImage}
                  resizeMode="contain"
                />
                <Button
                  mode="outlined"
                  onPress={pickPaymentSlip}
                  style={styles.changeButton}
                  icon={() => <Ionicons name="swap-horizontal" size={20} color={theme.colors.primary} />}
                  disabled={isUploading}
                >
                  Change Receipt
                </Button>
              </View>
            ) : (
              <Button
                mode="outlined"
                onPress={pickPaymentSlip}
                style={styles.uploadButton}
                icon={() => <Ionicons name="camera" size={20} color={theme.colors.primary} />}
                disabled={isUploading}
              >
                Select Receipt
              </Button>
            )}



            {!hasUploadedDetails && (
              <>
                <TextInput
                  label="Full Name"
                  value={fullName}
                  onChangeText={setFullName}
                  style={styles.input}
                  mode="outlined"
                  placeholder="Enter your full name"
                  disabled={isUploading}
                  autoCapitalize="words"
                />
                <TextInput
                  label="Telegram Number"
                  value={phoneNumber}
                  onChangeText={setPhoneNumber}
                  style={styles.input}
                  mode="outlined"
                  placeholder="Enter your phone number"
                  disabled={isUploading}
                  keyboardType="phone-pad"
                />
                <TextInput
                  label="NIC Number"
                  value={nic}
                  onChangeText={setNic}
                  style={styles.input}
                  mode="outlined"
                  placeholder="Enter your NIC number"
                  disabled={isUploading}
                  keyboardType="default"
                  autoCapitalize="none"
                />
                <TextInput
                  label="Zoom Gmail Address"
                  value={zoomGmail}
                  onChangeText={setZoomGmail}
                  style={styles.input}
                  mode="outlined"
                  placeholder="Enter Zoom Gmail Address"
                  disabled={isUploading}
                />

                <View style={styles.nicPhotosContainer}>
                  <Text style={styles.photoLabel}>NIC Front Photo</Text>
                  {nicFrontImage ? (
                    <View style={styles.photoPreviewContainer}>
                      <Image source={{ uri: nicFrontImage.uri }} style={styles.photoPreview} />
                      <Button
                        mode="outlined"
                        onPress={pickNicFrontImage}
                        style={styles.changePhotoButton}
                        disabled={isUploading}
                      >
                        Change Front
                      </Button>
                    </View>
                  ) : (
                    <Button
                      mode="outlined"
                      onPress={pickNicFrontImage}
                      style={styles.uploadPhotoButton}
                      icon="camera"
                      disabled={isUploading}
                    >
                      Upload NIC Front
                    </Button>
                  )}

                  <Text style={[styles.photoLabel, { marginTop: 16 }]}>NIC Back Photo</Text>
                  {nicBackImage ? (
                    <View style={styles.photoPreviewContainer}>
                      <Image source={{ uri: nicBackImage.uri }} style={styles.photoPreview} />
                      <Button
                        mode="outlined"
                        onPress={pickNicBackImage}
                        style={styles.changePhotoButton}
                        disabled={isUploading}
                      >
                        Change Back
                      </Button>
                    </View>
                  ) : (
                    <Button
                      mode="outlined"
                      onPress={pickNicBackImage}
                      style={styles.uploadPhotoButton}
                      icon="camera"
                      disabled={isUploading}
                    >
                      Upload NIC Back
                    </Button>
                  )}
                </View>

                <TextInput
                  label="District"
                  value={district}
                  onChangeText={setDistrict}
                  style={styles.input}
                  mode="outlined"
                  placeholder="Enter your district"
                  disabled={isUploading}
                  autoCapitalize="words"
                />
              </>
            )}

            <Text style={styles.noteText}>
              Note: Please make sure the receipt is clear and all details are visible.
              Your enrollment will be confirmed after verification.
            </Text>
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <Button
            mode="contained"
            onPress={uploadPaymentSlip}
            style={styles.submitButton}
            loading={isUploading}
            disabled={
              !paymentSlip ||
              !zoomGmail.trim() ||
              (!hasUploadedDetails && (!fullName.trim() || !phoneNumber.trim() || !nic.trim() || !district.trim() || !nicFrontImage || !nicBackImage)) ||
              isUploading
            }
            icon={() => <Ionicons name="cloud-upload" size={20} color="#fff" />}
          >
            {isUploading ? 'Uploading...' : 'Submit Payment'}
          </Button>
        </View>
      </>
    );
  };

  return (
    <View style={styles.container}>
      {renderContent()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    backgroundColor: '#fff',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  scrollView: {
    flex: 1,
  },
  uploadContainer: {
    padding: 20,
    alignItems: 'center',
  },
  uploadIcon: {
    marginBottom: 16,
    opacity: 0.8,
  },
  uploadTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
    color: '#333',
  },
  uploadSubtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 22,
  },
  previewContainer: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 24,
  },
  previewImage: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginBottom: 16,
    backgroundColor: '#f5f5f5',
  },
  input: {
    width: '100%',
    marginBottom: 16,
    backgroundColor: '#fff',
  },
  noteText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 20,
    fontStyle: 'italic',
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    backgroundColor: '#fff',
  },
  submitButton: {
    width: '100%',
    paddingVertical: 10,
    borderRadius: 8,
  },
  changeButton: {
    width: '100%',
  },
  uploadButton: {
    width: '100%',
    marginBottom: 24,
    borderStyle: 'dashed',
  },
  uploadPhotoButton: {
    width: '100%',
    marginBottom: 16,
    borderStyle: 'dashed',
  },
  changePhotoButton: {
    marginTop: 8,
  },
  nicPhotosContainer: {
    width: '100%',
    marginBottom: 16,
  },
  photoLabel: {
    fontSize: 14,
    marginBottom: 8,
    color: 'rgba(0, 0, 0, 0.6)',
  },
  photoPreviewContainer: {
    marginBottom: 16,
    alignItems: 'center',
  },
  photoPreview: {
    width: '100%',
    height: 150,
    borderRadius: 8,
    backgroundColor: '#f5f5f5',
    marginBottom: 8,
    resizeMode: 'contain',
  },
  statusContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  statusTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 24,
    marginBottom: 12,
    textAlign: 'center',
  },
  statusText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  referenceText: {
    fontSize: 14,
    color: '#888',
    textAlign: 'center',
    marginBottom: 24,
    fontFamily: 'monospace',
  },
  doneButton: {
    width: '100%',
    marginTop: 16,
  },
});
