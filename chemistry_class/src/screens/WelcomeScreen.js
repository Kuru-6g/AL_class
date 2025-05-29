import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, StatusBar } from 'react-native';

const WelcomeScreen = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="#1E88E5" barStyle="light-content" />
      <View style={styles.content}>
        <Text style={styles.title}>Welcome to</Text>
        <Text style={styles.appName}>Chemistry Class</Text>
        <Text style={styles.subtitle}>Learn, Explore, Succeed</Text>
      </View>
      <View style={styles.footer}>
        <Text style={styles.byLine}>By</Text>
        <Text style={styles.companyName}>Guru's Classes</Text>
      </View>
      <TouchableOpacity 
        style={styles.button}
        onPress={() => navigation.navigate('SignIn')}
      >
        <Text style={styles.buttonText}>Get Started</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1E88E5',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    color: 'white',
    marginBottom: 10,
    fontFamily: 'Arial',
  },
  appName: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 10,
    fontFamily: 'Arial',
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    fontFamily: 'Arial',
  },
  footer: {
    position: 'absolute',
    bottom: 100,
    alignItems: 'center',
  },
  byLine: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 14,
    marginBottom: 5,
    fontFamily: 'Arial',
  },
  companyName: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Arial',
  },
  button: {
    position: 'absolute',
    bottom: 40,
    backgroundColor: 'white',
    paddingVertical: 15,
    paddingHorizontal: 50,
    borderRadius: 30,
    alignItems: 'center',
    elevation: 3,
    width: '80%',
  },
  buttonText: {
    color: '#1E88E5',
    fontSize: 18,
    fontWeight: 'bold',
    fontFamily: 'Arial',
  },
});

export default WelcomeScreen;
