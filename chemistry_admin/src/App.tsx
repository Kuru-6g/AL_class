import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Box, CircularProgress } from '@mui/material';
import { AuthProvider, useAuth } from './contexts/AuthContext';

// Layout
import Layout from './components/Layout';
import PrivateRoute from './components/PrivateRoute';

// Pages
import Dashboard from './pages/Dashboard';
import Classes from './pages/classes/Classes';
import AddEditClass from './pages/classes/AddEditClass';
import Students from './pages/students/Students';
import StudentDetails from './pages/students/StudentDetails';
import Payments from './pages/payments/Payments';
import Login from './pages/auth/Login';
import Profile from './pages/Profile';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1E88E5',
    },
    secondary: {
      main: '#f50057',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
  },
});

// AppRoutes component to handle routing logic
const AppRoutes = () => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
      >
        <CircularProgress />
      </Box>
    );
  }


  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login" element={!isAuthenticated ? <Login /> : <Navigate to="/dashboard" replace />} />
      
      {/* Protected routes */}
      <Route element={<PrivateRoute />}>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<Dashboard />} />
        
        {/* Classes Routes */}
        <Route path="/classes" element={<Classes />} />
        <Route path="/classes/add" element={<AddEditClass />} />
        <Route path="/classes/edit/:id" element={<AddEditClass />} />
        
        {/* Students Routes */}
        <Route path="/students" element={<Students />} />
        <Route path="/students/:id" element={<StudentDetails />} />
        
        {/* Payments Routes */}
        <Route path="/payments" element={<Payments />} />
        
        {/* User Routes */}
        <Route path="/profile" element={<Profile />} />
      </Route>
      
      {/* 404 Route - Redirect to login if not authenticated, otherwise to dashboard */}
      <Route 
        path="*" 
        element={isAuthenticated ? 
          <Navigate to="/dashboard" replace /> : 
          <Navigate to="/login" state={{ from: window.location.pathname }} replace />
        } 
      />
    </Routes>
  );
};

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <AuthProvider>
          <Layout>
            <Box sx={{ flexGrow: 1, p: 3, mt: 8 }}>
              <AppRoutes />
            </Box>
          </Layout>
        </AuthProvider>
      </Router>
    </ThemeProvider>
  );
}

export default App;
