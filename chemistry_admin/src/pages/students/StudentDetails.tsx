import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  Avatar,
  Button,
  Tabs,
  Tab,
  Grid,
  Card,
  CardContent,
  Divider,
  Chip,
  IconButton,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  ListItemButton,
  ListItemIcon,
  Skeleton,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  CalendarToday as CalendarIcon,
  School as SchoolIcon,
  Receipt as ReceiptIcon,
  Edit as EditIcon,
} from '@mui/icons-material';

interface Student {
  id: string;
  name: string;
  email: string;
  phone: string;
  status: 'active' | 'inactive' | 'pending';
  joinDate: string;
  classesEnrolled: number;
  avatar?: string;
  address?: string;
  parentName?: string;
  parentPhone?: string;
  school?: string;
  grade?: string;
  [key: string]: any;
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`student-tabpanel-${index}`}
      aria-labelledby={`student-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `student-tab-${index}`,
    'aria-controls': `student-tabpanel-${index}`,
  };
}

const StudentDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [tabValue, setTabValue] = useState(0);
  const [student, setStudent] = useState<Student | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate API call
    const fetchStudent = async () => {
      try {
        // Replace with actual API call
        setTimeout(() => {
          setStudent({
            id: id || '1',
            name: 'John Doe',
            email: 'john.doe@example.com',
            phone: '+94771234567',
            status: 'active',
            joinDate: '2023-01-15',
            classesEnrolled: 3,
            avatar: 'https://randomuser.me/api/portraits/men/1.jpg',
            address: '123 Main St, City, Country',
            parentName: 'Jane Doe',
            parentPhone: '+94777654321',
            school: 'City High School',
            grade: '12',
          });
          setLoading(false);
        }, 500);
      } catch (error) {
        console.error('Error fetching student:', error);
        setLoading(false);
      }
    };

    fetchStudent();
  }, [id]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  if (loading) {
    return (
      <Box sx={{ p: 3 }}>
        <Skeleton variant="rectangular" width="100%" height={400} />
      </Box>
    );
  }

  if (!student) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography>Student not found</Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <IconButton onClick={() => navigate(-1)} sx={{ mr: 1 }}>
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h5" component="h1">
          Student Details
        </Typography>
      </Box>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={3}>
          <Grid columns={{ xs: 12, md: 4 }} sx={{ display: 'flex', justifyContent: 'center' }}>
            <Box sx={{ textAlign: 'center' }}>
              <Avatar
                src={student.avatar}
                alt={student.name}
                sx={{ width: 150, height: 150, mb: 2, mx: 'auto' }}
              />
              <Button
                variant="outlined"
                startIcon={<EditIcon />}
                onClick={() => navigate(`/students/edit/${student.id}`)}
                sx={{ mb: 2 }}
              >
                Edit Profile
              </Button>
            </Box>
          </Grid>
          <Grid columns={{ xs: 12, md: 8 }}>
            <Typography variant="h4" gutterBottom>
              {student.name}
            </Typography>
            <Chip
              label={student.status}
              color={
                student.status === 'active'
                  ? 'success'
                  : student.status === 'inactive'
                  ? 'error'
                  : 'warning'
              }
              size="small"
              sx={{ mb: 2 }}
            />

            <List>
              <ListItem disablePadding>
                <ListItemButton>
                  <ListItemIcon>
                    <EmailIcon color="action" />
                  </ListItemIcon>
                  <ListItemText primary="Email" secondary={student.email} />
                </ListItemButton>
              </ListItem>
              <Divider component="li" />
              <ListItem disablePadding>
                <ListItemButton>
                  <ListItemIcon>
                    <PhoneIcon color="action" />
                  </ListItemIcon>
                  <ListItemText primary="Phone" secondary={student.phone} />
                </ListItemButton>
              </ListItem>
              <Divider component="li" />
              <ListItem disablePadding>
                <ListItemButton>
                  <ListItemIcon>
                    <CalendarIcon color="action" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Join Date"
                    secondary={new Date(student.joinDate).toLocaleDateString()}
                  />
                </ListItemButton>
              </ListItem>
              <Divider component="li" />
              <ListItem disablePadding>
                <ListItemButton>
                  <ListItemIcon>
                    <SchoolIcon color="action" />
                  </ListItemIcon>
                  <ListItemText
                    primary="School"
                    secondary={student.school || 'Not specified'}
                  />
                </ListItemButton>
              </ListItem>
            </List>
          </Grid>
        </Grid>
      </Paper>


      <Paper sx={{ p: 3 }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          aria-label="student details tabs"
          sx={{ mb: 2 }}
        >
          <Tab label="Classes" {...a11yProps(0)} />
          <Tab label="Payments" {...a11yProps(1)} />
          <Tab label="Attendance" {...a11yProps(2)} />
        </Tabs>

        <TabPanel value={tabValue} index={0}>
          <Typography>No classes enrolled yet.</Typography>
        </TabPanel>
        <TabPanel value={tabValue} index={1}>
          <Typography>No payment history available.</Typography>
        </TabPanel>
        <TabPanel value={tabValue} index={2}>
          <Typography>No attendance records available.</Typography>
        </TabPanel>
      </Paper>
    </Box>
  );
};

export default StudentDetails;
