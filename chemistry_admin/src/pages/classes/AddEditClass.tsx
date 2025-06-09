import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  CircularProgress,
  SelectChangeEvent,
  Snackbar,
  Alert,
  InputAdornment,
} from '@mui/material';
import { Save as SaveIcon, ArrowBack as ArrowBackIcon } from '@mui/icons-material';
import { classApi } from '../../services/api';

type FormErrors = {
  className?: string;
  subject?: string;
  description?: string;
  status?: string;
  maxStudents?: string;
  price?: string;
  'schedule.day'?: string;
  'schedule.time'?: string;
  'schedule.duration'?: string;
};

interface ClassFormData {
  className: string;
  title: string; // Keeping for backward compatibility
  description: string;
  subject: string;
  status: 'active' | 'inactive' | 'upcoming';
  schedule: {
    day: string;
    time: string;
    duration: number;
  };
  maxStudents: number;
  price: number;
}

interface NotificationState {
  open: boolean;
  message: string;
  severity: 'success' | 'error' | 'info' | 'warning';
}

const AddEditClass = () => {
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const isEditMode = Boolean(id);
  
  const [formData, setFormData] = useState<ClassFormData>({
    className: '',
    title: '', // Keeping for backward compatibility
    description: '',
    subject: 'Chemistry',
    status: 'upcoming',
    schedule: {
      day: 'Monday',
      time: '10:00',
      duration: 60
    },
    maxStudents: 30,
    price: 0,
  });
  
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [notification, setNotification] = useState<NotificationState>({
    open: false,
    message: '',
    severity: 'info'
  });

  // Fetch class data if in edit mode
  useEffect(() => {
    if (isEditMode && id) {
      const fetchClass = async () => {
        setLoading(true);
        try {
          const response = await classApi.getById(id);
          const classData = response.data;
          
          // Transform the data to match our form
          const { _id, createdAt, updatedAt, ...formData } = classData;
          setFormData(formData as ClassFormData);
        } catch (error) {
          console.error('Error fetching class:', error);
          setNotification({
            open: true,
            message: 'Failed to load class data. Please try again.',
            severity: 'error'
          });
        } finally {
          setLoading(false);
        }
      };

      fetchClass();
    }
  }, [id, isEditMode]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | SelectChangeEvent<string>) => {
    const target = e.target as HTMLInputElement;
    const { name, value } = target;
    
    if (!name) return;

    // Handle nested schedule fields
    if (name.startsWith('schedule.')) {
      const scheduleField = name.split('.')[1] as keyof typeof formData.schedule;
      setFormData(prev => ({
        ...prev,
        schedule: {
          ...prev.schedule,
          [scheduleField]: scheduleField === 'duration' ? Number(value) : value
        }
      }));
      
      // Clear schedule field error when edited
      const errorKey = `schedule.${scheduleField}` as keyof FormErrors;
      if (errorKey in errors) {
        setErrors(prev => ({
          ...prev,
          [errorKey]: '',
        }));
      }
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: name === 'maxStudents' || name === 'price' ? Number(value) : value,
      }));
      
      // Clear regular field error when edited
      if (name in errors) {
        setErrors(prev => ({
          ...prev,
          [name]: '',
        }));
      }
    }
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    
    // Validate required fields
    if (!formData.className.trim()) {
      newErrors.className = 'Class name is required';
    }
    
    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }
    
    if (!formData.subject.trim()) {
      newErrors.subject = 'Subject is required';
    }
    
    // Validate schedule
    if (!formData.schedule.day) {
      newErrors['schedule.day'] = 'Day is required';
    }
    
    if (!formData.schedule.time) {
      newErrors['schedule.time'] = 'Time is required';
    }
    
    if (isNaN(formData.schedule.duration) || formData.schedule.duration <= 0) {
      newErrors['schedule.duration'] = 'Duration must be greater than 0';
    }
    
    // Validate numbers
    if (isNaN(formData.maxStudents) || formData.maxStudents <= 0) {
      newErrors.maxStudents = 'Maximum students must be greater than 0';
    }
    
    if (isNaN(formData.price) || formData.price < 0) {
      newErrors.price = 'Price cannot be negative';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setSubmitting(true);
    
    try {
      // Prepare the data for the API
      const classData = {
        className: formData.className,
        description: formData.description,
        subject: formData.subject,
        status: formData.status,
        schedule: {
          day: formData.schedule.day,
          time: formData.schedule.time,
          duration: Number(formData.schedule.duration),
        },
        maxStudents: Number(formData.maxStudents),
        price: Number(formData.price),
      };
      
      if (isEditMode && id) {
        // Update existing class
        await classApi.update(id, classData);
        setNotification({
          open: true,
          message: 'Class updated successfully!',
          severity: 'success'
        });
      } else {
        // Create new class
        await classApi.create(classData);
        setNotification({
          open: true,
          message: 'Class created successfully!',
          severity: 'success'
        });
      }
      
      // Navigate back to classes list after a short delay
      setTimeout(() => {
        navigate('/classes');
      }, 1500);
      
    } catch (error: any) {
      console.error('Error saving class:', error);
      const errorMessage = error.response?.data?.message || 'Failed to save class. Please try again.';
      setNotification({
        open: true,
        message: errorMessage,
        severity: 'error'
      });
    } finally {
      setSubmitting(false);
    }
  };
  
  const handleCloseNotification = () => {
    setNotification(prev => ({ ...prev, open: false }));
  };

  if (loading && isEditMode) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Snackbar 
        open={notification.open} 
        autoHideDuration={6000} 
        onClose={handleCloseNotification}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleCloseNotification} 
          severity={notification.severity}
          sx={{ width: '100%' }}
        >
          {notification.message}
        </Alert>
      </Snackbar>
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={() => navigate('/classes')}
        sx={{ mb: 2 }}
      >
        Back to Classes
      </Button>
      
      <Typography variant="h5" component="h1" gutterBottom>
        {isEditMode ? 'Edit Class' : 'Add New Class'}
      </Typography>
      
      <Paper sx={{ p: 3, maxWidth: 800, mx: 'auto' }}>
        <form onSubmit={handleSubmit} noValidate>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3 }}>
            <Box>
              <TextField
                fullWidth
                label="Class Name"
                name="className"
                value={formData.className}
                onChange={handleChange}
                error={!!errors.className}
                helperText={errors.className}
                required
              />
            </Box>
            <Box>
              <TextField
                fullWidth
                label="Subject"
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                error={!!errors.subject}
                helperText={errors.subject}
                required
              />
            </Box>
            
            <Box sx={{ gridColumn: { xs: '1', md: '1 / -1' } }}>
              <TextField
                fullWidth
                multiline
                rows={4}
                label="Description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                error={!!errors.description}
                helperText={errors.description}
                required
              />
            </Box>
            
            <Box>
              <FormControl fullWidth error={!!errors.status}>
                <InputLabel>Status</InputLabel>
                <Select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  label="Status"
                >
                  <MenuItem value="upcoming">Upcoming</MenuItem>
                  <MenuItem value="active">Active</MenuItem>
                  <MenuItem value="inactive">Inactive</MenuItem>
                </Select>
                {errors.status && <FormHelperText>{errors.status}</FormHelperText>}
              </FormControl>
            </Box>
            
            <Box>
              <TextField
                fullWidth
                label="Maximum Students"
                name="maxStudents"
                type="number"
                value={formData.maxStudents}
                onChange={handleChange}
                error={!!errors.maxStudents}
                helperText={errors.maxStudents}
                inputProps={{ min: 1 }}
                required
              />
            </Box>
            
            <Box>
              <TextField
                fullWidth
                label="Price (LKR)"
                name="price"
                type="number"
                value={formData.price}
                onChange={handleChange}
                error={!!errors.price}
                helperText={errors.price}
                inputProps={{ min: 0, step: 100 }}
                required
              />
            </Box>
            
            <Box>
              <FormControl fullWidth error={!!errors['schedule.day']}>
                <InputLabel id="schedule-day-label">Day</InputLabel>
                <Select
                  labelId="schedule-day-label"
                  name="schedule.day"
                  value={formData.schedule.day}
                  onChange={handleChange}
                  label="Day"
                >
                  {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((day) => (
                    <MenuItem key={day} value={day}>
                      {day}
                    </MenuItem>
                  ))}
                </Select>
                {errors['schedule.day'] && (
                  <FormHelperText>{errors['schedule.day']}</FormHelperText>
                )}
              </FormControl>
            </Box>
            <Box>
              <TextField
                fullWidth
                label="Time"
                name="schedule.time"
                type="time"
                value={formData.schedule.time}
                onChange={handleChange}
                InputLabelProps={{
                  shrink: true,
                }}
                inputProps={{
                  step: 300, // 5 min
                }}
                error={!!errors['schedule.time']}
                helperText={errors['schedule.time']}
                required
              />
            </Box>
            <Box>
              <TextField
                fullWidth
                label="Duration (minutes)"
                name="schedule.duration"
                type="number"
                value={formData.schedule.duration}
                onChange={handleChange}
                inputProps={{
                  min: 30,
                  step: 5,
                }}
                error={!!errors['schedule.duration']}
                helperText={errors['schedule.duration']}
                required
              />
            </Box>
            
            <Box sx={{ gridColumn: '1 / -1', mt: 2 }}>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                startIcon={submitting ? <CircularProgress size={20} /> : <SaveIcon />}
                disabled={submitting}
              >
                {isEditMode ? 'Update Class' : 'Create Class'}
              </Button>
            </Box>
          </Box>
        </form>
      </Paper>
    </Box>
  );
};

export default AddEditClass;
