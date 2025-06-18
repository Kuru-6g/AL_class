import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, StatusBar,
  Image, Alert, ActivityIndicator, Modal, TextInput,
  SafeAreaView, KeyboardAvoidingView, Platform
} from 'react-native';
import { GoogleSignin, statusCodes, isErrorWithCode } from '@react-native-google-signin/google-signin';
import { useAuth } from '@/contexts/AuthContext';
import * as SecureStore from 'expo-secure-store';
export default function SignInScreen() {
  const [isLoading, setIsLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [userInfo, setUserInfo] = useState(null);
  const [fullName, setFullName] = useState('');
  const [district, setDistrict] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const { loginWithGoogle } = useAuth();

  useEffect(() => {
    GoogleSignin.configure({
      webClientId: '1086184608136-fse16qkrnks5dp1ukaiv31n2lje26ofc.apps.googleusercontent.com',
      iosClientId: '1086184608136-c306d6f0ufqq66u8n18s48uf1d29lhqh.apps.googleusercontent.com',
      offlineAccess: true,
    });
  }, []);

  const handleGoogleSignIn = async () => {
    try {
      setIsLoading(true);
      await GoogleSignin.hasPlayServices();
      const result = await GoogleSignin.signIn();
      console.log('Google sign-in raw response:', JSON.stringify(result, null, 2));

      const { idToken, user } = result.data;
      if (!idToken || !user) {
        throw new Error('Google sign-in failed: Missing token or user');
      }
      await SecureStore.setItemAsync('idToken', idToken);
      console.log('Google sign-in successful, token stored');
      // Do NOT log in yet; wait for profile submission
      setUserInfo({ ...user, idToken });
      setShowModal(true);
    } catch (error) {
      if (isErrorWithCode(error)) {
        switch (error.code) {
          case statusCodes.SIGN_IN_CANCELLED:
            console.log('User cancelled Google sign-in.');
            return;
          case statusCodes.IN_PROGRESS:
            console.log('Google sign-in already in progress.');
            return;
          case statusCodes.PLAY_SERVICES_NOT_AVAILABLE:
            console.log('Play Services not available or outdated.');
            return;
          default:
            console.error('Unhandled Google sign-in error code:', error.code);
        }
      } else {
        console.error('Google sign-in error:', error);
      }
      Alert.alert('Google Sign-In Failed', error.message || 'Something went wrong.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitProfile = async () => {
    try {
      setIsLoading(true);
      console.log('Submitting profile to backend...');
      console.log(JSON.stringify({
        googleId: userInfo.id,
        email: userInfo.email,
        name: fullName || userInfo.name,
        phoneNumber,
        district,
        photo: userInfo.photo,
      }, null, 2));


      const response = await fetch('http://192.168.8.114:5001/api/users/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${userInfo?.idToken}`,
        },
        body: JSON.stringify({
          googleId: userInfo.id,
          email: userInfo.email,
          name: fullName || userInfo.name,
          phoneNumber,
          district,
          photo: userInfo.photo,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save user to database');
      }

      // Only now proceed to login
      await loginWithGoogle(userInfo.idToken, userInfo);
      setShowModal(false);
    } catch (error) {
      Alert.alert('Error', error.message || 'Something went wrong.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="#1E88E5" barStyle="light-content" />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Sign In</Text>
      </View>
      <View style={styles.content}>
        <Image
          source={require('@/assets/images/icon.png')}
          style={styles.logo}
          resizeMode="contain"
        />
        <Text style={styles.welcomeText}>Welcome</Text>
        <Text style={styles.subtitle}>Sign in with your Google account</Text>
        <TouchableOpacity
          style={styles.googleButton}
          onPress={handleGoogleSignIn}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.googleButtonText}>Sign in with Google</Text>
          )}
        </TouchableOpacity>
      </View>

      <Modal visible={showModal} animationType="slide" transparent>
        <SafeAreaView style={styles.modalOverlay}>
          <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Complete Your Profile</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="Full Name"
              value={fullName}
              onChangeText={setFullName}
            />
            <TextInput
              style={styles.modalInput}
              placeholder="District"
              value={district}
              onChangeText={setDistrict}
            />
            <TextInput
              style={styles.modalInput}
              placeholder="Phone Number"
              keyboardType="phone-pad"
              value={phoneNumber}
              onChangeText={setPhoneNumber}
            />
            <TextInput
              style={[styles.modalInput, { backgroundColor: '#eee' }]}
              value={userInfo?.email}
              editable={false}
            />
            <TouchableOpacity style={styles.googleButton} onPress={handleSubmitProfile}>
              <Text style={styles.googleButtonText}>Submit</Text>
            </TouchableOpacity>
          </KeyboardAvoidingView>
        </SafeAreaView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: {
    padding: 15,
    backgroundColor: '#1E88E5',
    alignItems: 'center',
  },
  headerTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    width: 100,
    height: 100,
    marginBottom: 30,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 30,
  },
  googleButton: {
    backgroundColor: '#1E88E5',
    paddingVertical: 15,
    paddingHorizontal: 25,
    borderRadius: 8,
    alignItems: 'center',
    minWidth: 220,
  },
  googleButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: '#fff',
    padding: 20,
    width: '85%',
    borderRadius: 10,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  modalInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    marginBottom: 15,
    width: '100%',
  },
});
