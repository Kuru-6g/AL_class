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
  Grid,
  SelectChangeEvent,
  Snackbar,
  Alert
} from '@mui/material';
import { Save as SaveIcon, ArrowBack as ArrowBackIcon } from '@mui/icons-material';
import { classApi } from '../../services/api';

interface ClassFormData {
  title: string;
  description: string;
  status: 'active' | 'inactive' | 'upcoming';
  startDate: string;
  endDate: string;
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
    title: '',
    description: '',
    status: 'upcoming',
    startDate: '',
    endDate: '',
    maxStudents: 30,
    price: 0,
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | SelectChangeEvent<string | number>) => {
    const { name, value } = e.target as HTMLInputElement;
    
    setFormData(prev => ({
      ...prev,
      [name]: name === 'maxStudents' || name === 'price' ? Number(value) : value,
    }));
    
    // Clear error when field is edited
    if (name in errors) {
      setErrors(prev => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.title.trim()) newErrors.title = 'Title is required';
    if (!formData.description.trim()) newErrors.description = 'Description is required';
    if (!formData.startDate) newErrors.startDate = 'Start date is required';
    if (!formData.endDate) newErrors.endDate = 'End date is required';
    if (new Date(formData.endDate) <= new Date(formData.startDate)) {
      newErrors.endDate = 'End date must be after start date';
    }
    if (formData.maxStudents <= 0) newErrors.maxStudents = 'Maximum students must be greater than 0';
    if (formData.price < 0) newErrors.price = 'Price cannot be negative';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setSubmitting(true);
    
    try {
      if (isEditMode && id) {
        // Update existing class
        await classApi.update(id, formData);
        setNotification({
          open: true,
          message: 'Class updated successfully!',
          severity: 'success'
        });
      } else {
        // Create new class
        await classApi.create(formData);
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
        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid columns={{ xs: 12 }}>
              <TextField
                fullWidth
                label="Class Title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                error={!!errors.title}
                helperText={errors.title}
                required
              />
            </Grid>
            
            <Grid columns={{ xs: 12 }}>
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
            </Grid>
            
            <Grid columns={{ xs: 12, sm: 6 }}>
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
            </Grid>
            
            <Grid columns={{ xs: 12, sm: 6 }}>
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
            </Grid>
            
            <Grid columns={{ xs: 12, sm: 6 }}>
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
            </Grid>
            
            <Grid columns={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label="Start Date"
                name="startDate"
                type="date"
                value={formData.startDate}
                onChange={handleChange}
                error={!!errors.startDate}
                helperText={errors.startDate}
                InputLabelProps={{
                  shrink: true,
                }}
                required
              />
            </Grid>
            
            <Grid columns={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label="End Date"
                name="endDate"
                type="date"
                value={formData.endDate}
                onChange={handleChange}
                error={!!errors.endDate}
                helperText={errors.endDate || 'End date must be after start date'}
                InputLabelProps={{
                  shrink: true,
                }}
                required
              />
            </Grid>
            
            <Grid columns={{ xs: 12 }} sx={{ mt: 2 }}>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                startIcon={submitting ? <CircularProgress size={20} /> : <SaveIcon />}
                disabled={submitting}
              >
                {isEditMode ? 'Update Class' : 'Create Class'}
              </Button>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </Box>
  );
};

export default AddEditClass;
