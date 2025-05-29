import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState, useEffect } from 'react';
import EditProfileModal from '@/components/EditProfileModal';
import { getUserProfile } from '@/services/userService';
import { useAuth } from '@/contexts/AuthContext';

interface MenuItem {
  icon: string;
  label: string;
  onPress?: () => void;
}

interface UserProfile {
  fullName: string;
  email: string;
  phoneNumber: string;
  nic: string;
  nicFrontImage?: string;
  nicBackImage?: string;
  createdAt?: string;
  studentId?: string;
}

const ProfileScreen = () => {
  const router = useRouter();
  const { user: authUser } = useAuth();
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<UserProfile>({
    fullName: '',
    email: '',
    phoneNumber: '',
    nic: '',
  });

  const fetchUserProfile = async () => {
    try {
      setIsLoading(true);
      const profile = await getUserProfile();
      setUser(profile);
    } catch (error) {
      console.error('Error fetching profile:', error);
      Alert.alert('Error', 'Failed to load profile');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (authUser?.token) {
      fetchUserProfile();
    }
  }, [authUser]);

  const menuItems: MenuItem[] = [
    { 
      icon: 'person-outline', 
      label: 'Edit Profile',
      onPress: () => setIsEditModalVisible(true)
    },
    { 
      icon: 'notifications-outline', 
      label: 'Notifications',
      onPress: () => console.log('Notifications')
    },
    { 
      icon: 'lock-closed-outline', 
      label: 'Privacy',
      onPress: () => console.log('Privacy')
    },
    { 
      icon: 'help-circle-outline', 
      label: 'Help & Support',
      onPress: () => console.log('Help & Support')
    },
    { 
      icon: 'information-circle-outline', 
      label: 'About',
      onPress: () => console.log('About')
    },
    { 
      icon: 'log-out-outline', 
      label: 'Logout',
      onPress: () => router.replace('/(auth)/sign-in')
    },
  ];

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatarPlaceholder}>
              <Ionicons name="person" size={50} color="#fff" />
            </View>
            <TouchableOpacity style={styles.editButton}>
              <Ionicons name="camera" size={16} color="#1E88E5" />
            </TouchableOpacity>
          </View>
          <Text style={styles.userName}>{user.fullName || 'User'}</Text>
          <Text style={styles.userEmail}>{user.email || 'No email provided'}</Text>
        </View>

        {/* Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>12</Text>
            <Text style={styles.statLabel}>Classes</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>24</Text>
            <Text style={styles.statLabel}>Completed</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>A+</Text>
            <Text style={styles.statLabel}>Grade</Text>
          </View>
        </View>

        {/* User Info */}
        <View style={styles.infoContainer}>
          <View style={styles.infoItem}>
            <Ionicons name="call-outline" size={20} color="#666" />
            <Text style={styles.infoText}>{user.phoneNumber || 'No phone number'}</Text>
          </View>
          <View style={styles.infoItem}>
            <Ionicons name="card-outline" size={20} color="#666" />
            <Text style={styles.infoText}>NIC: {user.nic || 'Not provided'}</Text>
          </View>
        </View>

        {/* Menu Items */}
        <View style={styles.menuContainer}>
          {menuItems.map((item, index) => (
            <TouchableOpacity 
              key={index} 
              style={styles.menuItem}
              onPress={item.onPress}
            >
              <View style={styles.menuItemLeft}>
                <Ionicons name={item.icon as any} size={22} color="#666" />
                <Text style={styles.menuItemText}>{item.label}</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#999" />
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      <EditProfileModal
        visible={isEditModalVisible}
        onClose={() => setIsEditModalVisible(false)}
        user={user}
        onUpdate={fetchUserProfile}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  avatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#1E88E5',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#1E88E5',
  },
  editButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 6,
    borderWidth: 1,
    borderColor: '#1E88E5',
  },
  userName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: '#666',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 20,
    backgroundColor: '#fff',
    marginBottom: 16,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1E88E5',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
  },
  infoContainer: {
    backgroundColor: '#fff',
    padding: 16,
    marginBottom: 16,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  infoText: {
    fontSize: 14,
    color: '#333',
    marginLeft: 12,
  },
  menuContainer: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuItemText: {
    fontSize: 15,
    color: '#333',
    marginLeft: 16,
  },
});

export default ProfileScreen;
