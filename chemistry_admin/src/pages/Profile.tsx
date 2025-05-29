import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Box, 
  Typography, 
  Paper, 
  Avatar, 
  List, 
  ListItem, 
  ListItemIcon, 
  ListItemText, 
  Divider,
  Button,
  Grid,
  TextField
} from '@mui/material';
import { 
  Person as PersonIcon, 
  Email as EmailIcon, 
  Phone as PhoneIcon,
  Edit as EditIcon,
  Save as SaveIcon,
  Cancel as CancelIcon
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';

const Profile: React.FC = () => {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = React.useState(false);
  const [formData, setFormData] = React.useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    avatar: user?.avatar || '',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({
          ...prev,
          avatar: reader.result as string
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    // Here you would typically make an API call to update the user's profile
    console.log('Saving profile:', formData);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setFormData({
      name: user?.name || '',
      email: user?.email || '',
      phone: user?.phone || '',
      avatar: user?.avatar || '',
    });
    setIsEditing(false);
  };

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        My Profile
      </Typography>
      
      <Paper sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={3}>
          <Grid columns={{ xs: 12, md: 4 }} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <Box sx={{ position: 'relative' }}>
              <Avatar 
                src={formData.avatar}
                sx={{ 
                  width: 120, 
                  height: 120, 
                  mb: 2,
                  bgcolor: 'primary.main',
                  fontSize: '3rem'
                }}
              >
                {formData.name?.charAt(0) || 'U'}
              </Avatar>
              {isEditing && (
                <label htmlFor="avatar-upload" style={{ position: 'absolute', bottom: 10, right: 10, cursor: 'pointer' }}>
                  <input
                    id="avatar-upload"
                    type="file"
                    accept="image/*"
                    style={{ display: 'none' }}
                    onChange={handleFileChange}
                  />
                  <EditIcon color="primary" sx={{ bgcolor: 'white', borderRadius: '50%', p: 0.5 }} />
                </label>
              )}
            </Box>
            {!isEditing && (
              <Button 
                variant="outlined" 
                startIcon={<EditIcon />}
                onClick={() => setIsEditing(true)}
              >
                Edit Profile
              </Button>
            )}
          </Grid>
          
          <Grid columns={{ xs: 12, md: 8 }}>
            <List>
              <ListItem>
                <ListItemIcon sx={{ minWidth: 40 }}>
                  <PersonIcon />
                </ListItemIcon>
                {isEditing ? (
                  <TextField
                    fullWidth
                    name="name"
                    label="Full Name"
                    value={formData.name}
                    onChange={handleInputChange}
                    variant="outlined"
                    size="small"
                  />
                ) : (
                  <ListItemText 
                    primary="Full Name" 
                    secondary={user?.name || 'Not provided'} 
                  />
                )}
              </ListItem>
              <Divider component="li" />
              
              <ListItem>
                <ListItemIcon>
                  <EmailIcon />
                </ListItemIcon>
                {isEditing ? (
                  <TextField
                    fullWidth
                    name="email"
                    label="Email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    variant="outlined"
                    size="small"
                  />
                ) : (
                  <ListItemText 
                    primary="Email" 
                    secondary={user?.email || 'Not provided'} 
                  />
                )}
              </ListItem>
              <Divider component="li" />
              
              <ListItem>
                <ListItemIcon>
                  <PhoneIcon />
                </ListItemIcon>
                {isEditing ? (
                  <TextField
                    fullWidth
                    name="phone"
                    label="Phone Number"
                    type="tel"
                    value={formData.phone}
                    onChange={handleInputChange}
                    variant="outlined"
                    size="small"
                  />
                ) : (
                  <ListItemText 
                    primary="Phone" 
                    secondary={user?.phone || 'Not provided'} 
                  />
                )}
              </ListItem>
            </List>
            
            {isEditing && (
              <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                <Button 
                  variant="outlined" 
                  color="inherit" 
                  startIcon={<CancelIcon />}
                  onClick={handleCancel}
                >
                  Cancel
                </Button>
                <Button 
                  variant="contained" 
                  color="primary" 
                  startIcon={<SaveIcon />}
                  onClick={handleSave}
                >
                  Save Changes
                </Button>
              </Box>
            )}
          </Grid>
        </Grid>
      </Paper>
      
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Account Settings
        </Typography>
        <List>
          <ListItem component="div">
            <ListItemText 
              primary="Change Password" 
              secondary="Update your account password" 
            />
          </ListItem>
          <Divider component="li" />
          <ListItem component="div">
            <ListItemText 
              primary="Notification Preferences" 
              secondary="Manage email and notification settings" 
            />
          </ListItem>
        </List>
      </Paper>
    </Box>
  );
};

export default Profile;
