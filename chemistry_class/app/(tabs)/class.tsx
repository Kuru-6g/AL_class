import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, FlatList, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Checkbox, Button, SegmentedButtons } from 'react-native-paper';
import { useState, useMemo, useEffect, useCallback } from 'react';
import { router, useFocusEffect } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getCurrentUserId, getUserEnrolledClassesKey, isEnrollmentValid } from '../../utils/auth';

interface EnrolledClass {
  classId: string;
  enrolledAt: string;
}

export type ClassItem = {
  id: string;
  title: string;
  subject: string;
  schedule: string;
  teacher: string;
  color: string;
  isPaid?: boolean;
  paymentStatus?: 'pending' | 'approved' | 'rejected';
  thumbnail?: string;
  duration?: string;
  students?: number;
  isLive?: boolean;
  date?: string;
  teacherAvatar?: string;
  category?: 'ongoing' | 'upcoming' | 'completed';
  isEnrolled?: boolean;
};

const allClasses: ClassItem[] = [
  {
    id: '1',
    title: 'Organic Chemistry',
    subject: 'Chemistry',
    schedule: 'Mon, Wed, Fri • 08:00 AM',
    teacher: 'Dr. Samantha Smith',
    color: '#4CAF50',
  },
  {
    id: '2',
    title: 'Inorganic Chemistry',
    subject: 'Chemistry',
    schedule: 'Tue, Thu • 10:00 AM',
    teacher: 'Prof. Robert Johnson',
    color: '#2196F3',
  },
  {
    id: '3',
    title: 'Physical Chemistry',
    subject: 'Chemistry',
    schedule: 'Mon, Wed, Fri • 02:00 PM',
    teacher: 'Dr. Emily Williams',
    color: '#9C27B0',
  },
  {
    id: '4',
    title: 'Analytical Chemistry',
    subject: 'Chemistry',
    schedule: 'Tue, Thu • 01:00 PM',
    teacher: 'Dr. Michael Brown',

    color: '#FF9800',
  },
  {
    id: '5',
    title: 'Biochemistry',
    subject: 'Chemistry',
    schedule: 'Mon, Wed • 04:00 PM',
    teacher: 'Dr. Sarah Taylor',

    color: '#E91E63',
  },
  {
    id: '6',
    title: 'Industrial Chemistry',
    subject: 'Chemistry',
    schedule: 'Tue, Thu • 03:00 PM',
    teacher: 'Dr. James Anderson',

    color: '#00BCD4',
  },
  {
    id: '7',
    title: 'Environmental Chemistry',
    subject: 'Chemistry',
    schedule: 'Fri • 09:00 AM',
    teacher: 'Dr. Patricia Martin',

    color: '#8BC34A',
  },
];

const ClassScreen = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [checkedClasses, setCheckedClasses] = useState<{[key: string]: boolean}>({});
  const [enrolledClasses, setEnrolledClasses] = useState<Set<string>>(new Set());
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [activeTab, setActiveTab] = useState<'all' | 'my'>('all');
  const [classes, setClasses] = useState<ClassItem[]>(allClasses);
  const [enrollments, setEnrollments] = useState<Record<string, string>>({});

  const getRemainingDays = (enrolledAt: string): number => {
    try {
      const enrollmentDate = new Date(enrolledAt);
      const expirationDate = new Date(enrollmentDate);
      expirationDate.setDate(expirationDate.getDate() + 30);
      
      const diffTime = expirationDate.getTime() - new Date().getTime();
      return Math.ceil(diffTime / (1000 * 60 * 60 * 24)); // Convert to days
    } catch (error) {
      console.error('Error calculating remaining days:', error);
      return 0;
    }
  };

  const toggleCheck = (classId: string) => {
    setCheckedClasses(prev => ({
      ...prev,
      [classId]: !prev[classId]
    }));
  };

  // Load enrolled classes from storage on component mount and when the screen comes into focus
  const loadEnrolledClasses = useCallback(async () => {
    try {
      const userId = await getCurrentUserId();
      if (!userId) {
        console.log('User not authenticated, skipping enrolled classes load');
        setIsLoading(false);
        return;
      }

      const enrolledClassesKey = getUserEnrolledClassesKey(userId);
      const savedClasses = await AsyncStorage.getItem(enrolledClassesKey);
      
      if (savedClasses) {
        try {
          // Parse and filter out expired enrollments
          const enrolledItems: EnrolledClass[] = JSON.parse(savedClasses);
          const validEnrollments = enrolledItems.filter(item => 
            item?.classId && 
            item?.enrolledAt && 
            isEnrollmentValid(item.enrolledAt)
          );
          
          // If we filtered out any expired enrollments, update storage
          if (validEnrollments.length !== enrolledItems.length) {
            await AsyncStorage.setItem(
              enrolledClassesKey,
              JSON.stringify(validEnrollments)
            );
          }
          
          const enrolledSet = new Set(validEnrollments.map(item => item.classId));
          setEnrolledClasses(enrolledSet);
          
          // Update the classes to reflect enrollment status
          setClasses(prevClasses => 
            prevClasses.map(cls => ({
              ...cls,
              isEnrolled: enrolledSet.has(cls.id)
            }))
          );
        } catch (error) {
          console.error('Error parsing enrolled classes:', error);
          // If there's an error parsing, clear the enrollment state
          setEnrolledClasses(new Set());
          setClasses(prevClasses => 
            prevClasses.map(cls => ({
              ...cls,
              isEnrolled: false
            }))
          );
        }
      } else {
        // If no enrolled classes, make sure to clear any previous state
        setEnrolledClasses(new Set());
        setClasses(prevClasses => 
          prevClasses.map(cls => ({
            ...cls,
            isEnrolled: false
          }))
        );
      }
    } catch (error) {
      console.error('Failed to load enrolled classes:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Load classes on mount
  useEffect(() => {
    loadEnrolledClasses();
  }, [loadEnrolledClasses]);

  // Refresh when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      loadEnrolledClasses();
    }, [loadEnrolledClasses])
  );

  // Get filtered classes based on selected tab and filters
  const filteredClasses = useMemo(() => {
    return classes.filter(classItem => {
      // For 'My Classes' tab, only show enrolled classes
      if (activeTab === 'my' && !enrolledClasses.has(classItem.id)) {
        return false;
      }
      
      // Apply category filter if not 'all'
      if (selectedCategory !== 'all' && classItem.category !== selectedCategory) {
        return false;
      }
      
      return true;
    });
  }, [classes, enrolledClasses, selectedCategory, activeTab]);

  const selectedClasses = useMemo(() => {
    return filteredClasses.filter(cls => checkedClasses[cls.id]);
  }, [filteredClasses, checkedClasses]);

  const handleJoinClass = () => {
    if (selectedClasses.length === 0) return;
    router.push({
      pathname: '/payment',
      params: { classIds: selectedClasses.map(c => c.id).join(',') }
    });
  };



  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1E88E5" />
        <Text style={styles.loadingText}>Loading classes...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>
            {activeTab === 'all' ? 'All Classes' : 'My Classes'}
          </Text>
          <Text style={styles.headerSubtitle}>
            {activeTab === 'all' 
              ? 'Browse all available courses' 
              : 'Your enrolled courses'}
          </Text>
        </View>
      </View>

      <View style={styles.tabContainer}>
        <SegmentedButtons
          value={activeTab}
          onValueChange={(value) => setActiveTab(value as 'all' | 'my')}
          buttons={[
            {
              value: 'all',
              label: 'All Classes',
              style: [
                styles.tabButton,
                activeTab === 'all' && styles.activeTabButton
              ],
              labelStyle: [
                styles.tabLabel,
                activeTab === 'all' && styles.activeTabLabel
              ]
            },
            {
              value: 'my',
              label: 'My Classes',
              style: [
                styles.tabButton,
                activeTab === 'my' && styles.activeTabButton
              ],
              labelStyle: [
                styles.tabLabel,
                activeTab === 'my' && styles.activeTabLabel
              ]
            },
          ]}
          style={styles.segmentedButtons}
        />
      </View>

      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        <View style={styles.filterContainer}>
          <TouchableOpacity 
            style={[styles.filterChip, selectedCategory === 'all' && styles.filterChipActive]}
            onPress={() => setSelectedCategory('all')}
          >
            <Text style={[styles.filterChipText, selectedCategory === 'all' && styles.filterChipTextActive]}>All</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.filterChip, selectedCategory === 'ongoing' && styles.filterChipActive]}
            onPress={() => setSelectedCategory('ongoing')}
          >
            <Text style={[styles.filterChipText, selectedCategory === 'ongoing' && styles.filterChipTextActive]}>Ongoing</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.filterChip, selectedCategory === 'upcoming' && styles.filterChipActive]}
            onPress={() => setSelectedCategory('upcoming')}
          >
            <Text style={[styles.filterChipText, selectedCategory === 'upcoming' && styles.filterChipTextActive]}>Upcoming</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.filterChip, selectedCategory === 'completed' && styles.filterChipActive]}
            onPress={() => setSelectedCategory('completed')}
          >
            <Text style={[styles.filterChipText, selectedCategory === 'completed' && styles.filterChipTextActive]}>Completed</Text>
          </TouchableOpacity>
        </View>

        {filteredClasses.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons 
              name={activeTab === 'all' ? 'search-outline' : 'book-outline'} 
              size={48} 
              color="#ccc" 
            />
            <Text style={styles.emptyStateText}>
              {activeTab === 'all' 
                ? 'No classes available'
                : 'No enrolled classes'}
            </Text>
            <Text style={styles.emptyStateSubtext}>
              {activeTab === 'all'
                ? 'Check back later for new classes.'
                : selectedCategory === 'all' 
                  ? 'Enroll in classes to see them here.'
                  : `You don't have any ${selectedCategory} classes.`}
            </Text>
          </View>
        ) : (
          filteredClasses.map((classItem) => (
          <View 
            key={classItem.id} 
            style={[
              styles.classCard,
              checkedClasses[classItem.id] && styles.classCardSelected
            ]}
          >
            <View style={styles.checkboxContainer}>
              <Checkbox
                status={checkedClasses[classItem.id] ? 'checked' : 'unchecked'}
                onPress={() => toggleCheck(classItem.id)}
                color={classItem.color}
                uncheckedColor="#ccc"
              />
            </View>
            
            <View style={[styles.classHeader, { backgroundColor: classItem.color }]}>
              <View style={styles.classIcon}>
                <Ionicons 
                  name={classItem.subject === 'Chemistry' ? 'flask' : 'book'} 
                  size={20} 
                  color="#fff" 
                />
              </View>
              <Text style={styles.classSubject}>{classItem.subject}</Text>
              <View style={styles.progressBadge}>
                {/*<Text style={styles.progressBadgeText}>{classItem.progress}%</Text>*/}
              </View>
            </View>
            
            <View style={styles.classContent}>
              <View style={styles.classTitleRow}>
                <Text style={styles.classTitle} numberOfLines={1} ellipsizeMode="tail">
                  {classItem.title}
                </Text>
                <View style={[styles.statusDot, { 
                  backgroundColor: 
                    // classItem.progress > 70 ? '#4CAF50' :
                    classItem.progress > 30 ? '#FFC107' : '#F44336'
                }]} />
              </View>
              
              <View style={styles.classInfo}>
                <Ionicons name="time-outline" size={16} color="#666" />
                <Text style={styles.classSchedule}>{classItem.schedule}</Text>
              </View>
              
              <View style={styles.classInfo}>
                <Ionicons name="person-outline" size={16} color="#666" />
                <Text style={styles.classTeacher} numberOfLines={1}>
                  {classItem.teacher}
                </Text>
              </View>
              
              <View style={styles.progressContainer}>
                {/*<View style={styles.progressBar}>*/}
                {/*  <View*/}
                {/*    style={{*/}
                {/*      height: '100%',*/}
                {/*      width: `${classItem.progress}%`,*/}
                {/*      backgroundColor: classItem.color,*/}
                {/*      borderRadius: 4,*/}
                {/*    }}*/}
                {/*  />*/}
                {/*</View>*/}
                <View style={styles.progressTextRow}>
                  {/*<Text style={styles.progressLabel}>Course Progress</Text>*/}
                  {/*<Text style={styles.progressPercent}>{classItem.progress}%</Text>*/}
                </View>
              </View>
              
              <View style={styles.classActions}>
                <TouchableOpacity style={styles.actionButton}>
                  <Ionicons name="document-text-outline" size={18} color="#1E88E5" />
                  <Text style={styles.actionText}>Materials</Text>
                </TouchableOpacity>
                <View style={styles.divider} />
                <TouchableOpacity style={styles.actionButton}>
                  <Ionicons name="chatbubble-ellipses-outline" size={18} color="#1E88E5" />
                  <Text style={styles.actionText}>Discuss</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
          ))
        )}
      </ScrollView>

      {selectedClasses.length > 0 && (
        <View style={styles.footer}>
          <Button 
            mode="contained" 
            onPress={handleJoinClass}
            style={[styles.joinButton, { backgroundColor: '#4CAF50' }]}
            labelStyle={styles.joinButtonLabel}
            icon={() => <Ionicons name="arrow-forward" size={20} color="#fff" />}
            contentStyle={{ flexDirection: 'row-reverse' }}
          >
            Join {selectedClasses.length} Class{selectedClasses.length !== 1 ? 'es' : ''}
          </Button>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  loadingText: {
    marginTop: 10,
    color: '#666',
    fontSize: 16,
  },
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  tabContainer: {
    paddingHorizontal: 16,
    paddingTop: 16,
    backgroundColor: '#fff',
  },
  segmentedButtons: {
    borderRadius: 10,
    overflow: 'hidden',
  },
  tabButton: {
    flex: 1,
    borderWidth: 0,
    borderRadius: 8,
    backgroundColor: '#f5f5f5',
  },
  activeTabButton: {
    backgroundColor: '#4CAF50',
  },
  tabLabel: {
    color: '#666',
    fontSize: 14,
    fontWeight: '500',
  },
  activeTabLabel: {
    color: '#fff',
    fontWeight: '600',
  },
  header: {
    padding: 24,
    paddingTop: 60,
    paddingBottom: 16,
    backgroundColor: '#fff',
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#2c3e50',
    marginBottom: 4,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#2c3e50',
    marginTop: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#7f8c8d',
    marginBottom: 2,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2c3e50',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#7f8c8d',
    textAlign: 'center',
    lineHeight: 20,
  },
  addButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
  },
  scrollView: {
    flex: 1,
    padding: 16,
    paddingTop: 8,
  },
  filterContainer: {
    flexDirection: 'row',
    marginBottom: 20,
    paddingHorizontal: 4,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f1f2f6',
    marginRight: 8,
  },
  filterChipActive: {
    backgroundColor: '#4CAF50',
  },
  filterChipText: {
    color: '#7f8c8d',
    fontSize: 14,
    fontWeight: '500',
  },
  filterChipTextActive: {
    color: '#fff',
    fontWeight: '600',
  },
  classCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1.5,
    borderColor: 'transparent',
    transform: [{ scale: 1 }],
  },
  classCardSelected: {
    borderColor: '#4CAF50',
    transform: [{ scale: 0.99 }],
  },
  checkboxContainer: {
    position: 'absolute',
    top: 12,
    right: 12,
    zIndex: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 12,
    padding: 2,
  },
  classHeader: {
    padding: 20,
    paddingBottom: 16,
    position: 'relative',
  },
  classIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  classSubject: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  progressBadge: {
    position: 'absolute',
    right: 20,
    top: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  progressBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },
  classContent: {
    padding: 20,
    paddingTop: 16,
  },
  classTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  classTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2c3e50',
    flex: 1,
    marginRight: 8,
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  classInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  classSchedule: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
  },
  classTeacher: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
    flex: 1,
  },
  progressContainer: {
    marginTop: 16,
    marginBottom: 8,
  },
  progressBar: {
    height: 6,
    backgroundColor: '#f1f2f6',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressTextRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  progressLabel: {
    fontSize: 12,
    color: '#7f8c8d',
    fontWeight: '500',
  },
  progressPercent: {
    fontSize: 13,
    fontWeight: '700',
    color: '#2c3e50',
  },
  classActions: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#f1f2f6',
    paddingTop: 16,
    marginTop: 16,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionText: {
    color: '#1E88E5',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
  divider: {
    width: 1,
    backgroundColor: '#f1f2f6',
    marginHorizontal: 4,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#f1f2f6',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 4,
  },
  joinButton: {
    borderRadius: 12,
    paddingVertical: 10,
    elevation: 2,
  },
  joinButtonLabel: {
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
});

export default ClassScreen;
