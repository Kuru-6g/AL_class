import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  IconButton,
  Chip,
  TextField,
  InputAdornment,
} from '@mui/material';
import { Add as AddIcon, Search as SearchIcon, Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';

interface Class {
  id: string;
  title: string;
  description: string;
  status: 'active' | 'inactive' | 'upcoming';
  students: number;
  startDate: string;
  endDate: string;
}

const Classes = () => {
  const navigate = useNavigate();
  const [classes, setClasses] = useState<Class[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  // Mock data - replace with API call
  useEffect(() => {
    const fetchClasses = async () => {
      try {
        // Simulate API call
        setTimeout(() => {
          setClasses([
            {
              id: '1',
              title: 'Organic Chemistry Basics',
              description: 'Introduction to organic chemistry concepts',
              status: 'active',
              students: 25,
              startDate: '2023-01-15',
              endDate: '2023-06-15',
            },
            {
              id: '2',
              title: 'Advanced Physical Chemistry',
              description: 'In-depth study of physical chemistry principles',
              status: 'upcoming',
              students: 0,
              startDate: '2023-07-01',
              endDate: '2023-12-15',
            },
            // Add more mock data as needed
          ]);
          setLoading(false);
        }, 500);
      } catch (error) {
        console.error('Error fetching classes:', error);
        setLoading(false);
      }
    };

    fetchClasses();
  }, []);

  const handleDelete = (id: string) => {
    // Implement delete functionality
    console.log('Delete class:', id);
  };

  const filteredClasses = classes.filter((cls) =>
    cls.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cls.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'success';
      case 'inactive':
        return 'error';
      case 'upcoming':
        return 'warning';
      default:
        return 'default';
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" component="h1">
          Manage Classes
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => navigate('/classes/add')}
        >
          Add New Class
        </Button>
      </Box>

      <Paper sx={{ p: 2, mb: 3 }}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Search classes..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />
      </Paper>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Title</TableCell>
              <TableCell>Description</TableCell>
              <TableCell align="center">Status</TableCell>
              <TableCell align="center">Students</TableCell>
              <TableCell align="center">Start Date</TableCell>
              <TableCell align="center">End Date</TableCell>
              <TableCell align="center">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredClasses.length > 0 ? (
              filteredClasses.map((cls) => (
                <TableRow key={cls.id} hover>
                  <TableCell>{cls.title}</TableCell>
                  <TableCell>{cls.description}</TableCell>
                  <TableCell align="center">
                    <Chip
                      label={cls.status.charAt(0).toUpperCase() + cls.status.slice(1)}
                      color={getStatusColor(cls.status)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell align="center">{cls.students}</TableCell>
                  <TableCell align="center">{new Date(cls.startDate).toLocaleDateString()}</TableCell>
                  <TableCell align="center">{new Date(cls.endDate).toLocaleDateString()}</TableCell>
                  <TableCell align="center">
                    <IconButton
                      color="primary"
                      onClick={() => navigate(`/classes/edit/${cls.id}`)}
                      size="small"
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      color="error"
                      onClick={() => handleDelete(cls.id)}
                      size="small"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 3 }}>
                  No classes found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default Classes;
