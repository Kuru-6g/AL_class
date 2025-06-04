import {
  View, Text, StyleSheet, TextInput, TouchableOpacity, StatusBar,
  Image, Alert, ActivityIndicator
} from 'react-native';
import { Link } from 'expo-router';
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { GoogleSignin, statusCodes, isErrorWithCode } from '@react-native-google-signin/google-signin';

export default function SignInScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login, loginWithGoogle } = useAuth(); // assumes your AuthContext handles Google login

  useEffect(() => {
    GoogleSignin.configure({
      webClientId: '1086184608136-fse16qkrnks5dp1ukaiv31n2lje26ofc.apps.googleusercontent.com',
      iosClientId: '1086184608136-c306d6f0ufqq66u8n18s48uf1d29lhqh.apps.googleusercontent.com',
      offlineAccess: true,
    });
  }, []);

  const handleSignIn = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter both email and password');
      return;
    }

    try {
      setIsLoading(true);
      await login(email, password);
    } catch (error) {
      console.error('Login error:', error);
      let errorMessage = 'An error occurred during login';
      if (error.message.includes('Invalid credentials')) {
        errorMessage = 'Invalid email or password. Please try again.';
      } else if (error.message.includes('network')) {
        errorMessage = 'Unable to connect to the server.';
      } else if (error.message) {
        errorMessage = error.message;
      }
      Alert.alert('Login Failed', errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      await GoogleSignin.hasPlayServices();

      const result = await GoogleSignin.signIn();
      console.log('Google sign-in raw response:', JSON.stringify(result, null, 2));

      if (result?.type !== 'success' || !result.data?.user || !result.data?.idToken) {
        throw new Error('Google sign-in failed: Incomplete response');
      }

      const { user, idToken } = result.data;

      await loginWithGoogle(idToken, user);
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
        console.error('Unknown Google sign-in error:', error);
      }

      Alert.alert('Google Sign-In Failed', error.message || 'Something went wrong.');
    }
  };



  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="#1E88E5" barStyle="light-content" />

      <View style={styles.header}>
        <Link href=".." asChild>
          <Text style={styles.backButton}>←</Text>
        </Link>
        <Text style={styles.headerTitle}>Sign In</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.content}>
        <View style={styles.logoContainer}>
          <Image
            source={require('@/assets/images/icon.png')}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>

        <Text style={styles.welcomeText}>Welcome Back</Text>
        <Text style={styles.subtitle}>Sign in to continue</Text>

        <View style={styles.formContainer}>
          <Text style={styles.inputLabel}>Email</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter your email"
            placeholderTextColor="#999"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <View style={styles.passwordHeader}>
            <Text style={styles.inputLabel}>Password</Text>
            <TouchableOpacity>
              <Text style={styles.forgotPassword}>Forgot Password?</Text>
            </TouchableOpacity>
          </View>

          <TextInput
            style={styles.input}
            placeholder="Enter your password"
            placeholderTextColor="#999"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          <TouchableOpacity
            style={[styles.signInButton, isLoading && styles.disabledButton]}
            onPress={handleSignIn}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.signInButtonText}>SIGN IN</Text>
            )}
          </TouchableOpacity>

          {/* Google Sign-In Button */}
          <TouchableOpacity
            style={styles.googleButton}
            onPress={handleGoogleSignIn}
          >
            <Text style={styles.googleButtonText}>Sign in with Google</Text>
          </TouchableOpacity>

          <View style={styles.signUpContainer}>
            <Text style={styles.signUpText}>Don&#39;t have an account? </Text>
            <Link href="/(auth)/sign-up" asChild>
              <Text style={styles.signUpLink}>Sign Up</Text>
            </Link>
          </View>
        </View>
      </View>
    </View>
  );
}



const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#1E88E5',
  },
  backButton: {
    color: 'white',
    fontSize: 24,
    width: 24,
    textAlign: 'center',
  },
  headerTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  logoContainer: {
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 30,
  },
  logo: {
    width: 100,
    height: 100,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 30,
  },
  formContainer: {
    width: '100%',
  },
  inputLabel: {
    fontSize: 14,
    color: '#333',
    marginBottom: 8,
    fontWeight: '500',
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 20,
    fontSize: 16,
    color: '#333',
  },
  passwordHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  forgotPassword: {
    color: '#1E88E5',
    fontSize: 14,
    fontWeight: '500',
  },
  signInButton: {
    backgroundColor: '#1E88E5',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 20,
  },
  signInButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  disabledButton: {
    backgroundColor: '#90CAF9',
    opacity: 0.7,
  },
  signUpContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
  },
  signUpText: {
    color: '#666',
    fontSize: 14,
  },
  signUpLink: {
    color: '#1E88E5',
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 5,
  },
});
