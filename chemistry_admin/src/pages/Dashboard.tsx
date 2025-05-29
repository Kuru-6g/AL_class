import React from 'react';
import { Grid, Paper, Typography, Box } from '@mui/material';
import {
  Class as ClassIcon,
  People as PeopleIcon,
  Payment as PaymentIcon,
  CheckCircle as CheckCircleIcon,
} from '@mui/icons-material';

const Dashboard = () => {
  // Mock data - replace with actual data from your API
  const stats = [
    { title: 'Total Classes', value: '12', icon: <ClassIcon fontSize="large" color="primary" /> },
    { title: 'Total Students', value: '245', icon: <PeopleIcon fontSize="large" color="secondary" /> },
    { title: 'Pending Payments', value: '18', icon: <PaymentIcon fontSize="large" color="warning" /> },
    { title: 'Active Students', value: '215', icon: <CheckCircleIcon fontSize="large" color="success" /> },
  ];

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Dashboard
      </Typography>
      
      <Grid container spacing={3} sx={{ mt: 2 }}>
        {stats.map((stat, index) => (
          <Grid key={index} columns={{ xs: 12, sm: 6, md: 3 }}>
            <Paper
              elevation={2}
              sx={{
                p: 3,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                height: '100%',
              }}
            >
              <Box sx={{ mb: 1 }}>{stat.icon}</Box>
              <Typography variant="h5" component="div" gutterBottom>
                {stat.value}
              </Typography>
              <Typography variant="subtitle1" color="textSecondary">
                {stat.title}
              </Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>

      {/* Add more dashboard content here */}
      <Grid container spacing={3} sx={{ mt: 2 }}>
        <Grid columns={{ xs: 12, md: 8 }}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Recent Activities
            </Typography>
            <Typography color="textSecondary">
              No recent activities to display
            </Typography>
          </Paper>
        </Grid>
        <Grid columns={{ xs: 12, md: 4 }}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Quick Actions
            </Typography>
            {/* Add quick action buttons here */}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;
