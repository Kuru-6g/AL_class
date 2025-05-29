import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  TextField,
  InputAdornment,
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  FormHelperText,
  SelectChangeEvent,
  CircularProgress,
} from '@mui/material';
import {
  Search as SearchIcon,
  MoreVert as MoreVertIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Receipt as ReceiptIcon,
  FilterList as FilterListIcon,
} from '@mui/icons-material';
import { format } from 'date-fns';

interface Payment {
  id: string;
  studentId: string;
  studentName: string;
  classId: string;
  className: string;
  amount: number;
  status: 'pending' | 'approved' | 'rejected';
  paymentDate: string;
  paymentMethod: string;
  receiptNumber?: string;
  verifiedBy?: string;
  verifiedAt?: string;
  [key: string]: any; // Add index signature
}

const Payments = () => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [openVerifyDialog, setOpenVerifyDialog] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState<'approve' | 'reject'>('approve');
  const [verificationNote, setVerificationNote] = useState('');

  // Mock data - replace with API call
  useEffect(() => {
    const fetchPayments = async () => {
      try {
        // Simulate API call
        setTimeout(() => {
          setPayments([
            {
              id: '1',
              studentId: '1',
              studentName: 'John Doe',
              classId: '1',
              className: 'Organic Chemistry Basics',
              amount: 5000,
              status: 'pending',
              paymentDate: '2023-05-20T10:30:00',
              paymentMethod: 'Bank Transfer',
              receiptNumber: 'RC-20230520-001',
            },
            {
              id: '2',
              studentId: '2',
              studentName: 'Jane Smith',
              classId: '2',
              className: 'Advanced Physical Chemistry',
              amount: 5000,
              status: 'approved',
              paymentDate: '2023-05-18T14:45:00',
              paymentMethod: 'Credit Card',
              receiptNumber: 'RC-20230518-002',
              verifiedBy: 'Admin User',
              verifiedAt: '2023-05-18T15:30:00',
            },
          ]);
          setLoading(false);
        }, 500);
      } catch (error) {
        console.error('Error fetching payments:', error);
        setLoading(false);
      }
    };

    fetchPayments();
  }, []);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, payment: Payment) => {
    setAnchorEl(event.currentTarget);
    setSelectedPayment(payment);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedPayment(null);
  };

  const handleVerifyPayment = (status: 'approve' | 'reject') => {
    setVerificationStatus(status);
    setOpenVerifyDialog(true);
    handleMenuClose();
  };

  const handleVerifyConfirm = () => {
    if (!selectedPayment) return;
    
    // Here you would typically make an API call to update the payment status
    console.log(`Marking payment ${selectedPayment.id} as ${verificationStatus}ed`);
    console.log('Verification note:', verificationNote);
    
    // Update local state for demo purposes
    setPayments(prevPayments =>
      prevPayments.map(payment =>
        payment.id === selectedPayment.id
          ? {
              ...payment,
              status: verificationStatus === 'approve' ? 'approved' : 'rejected',
              verifiedBy: 'Current User', // Replace with actual user
              verifiedAt: new Date().toISOString(),
            }
          : payment
      )
    );
    
    setOpenVerifyDialog(false);
    setVerificationNote('');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'success';
      case 'rejected':
        return 'error';
      case 'pending':
        return 'warning';
      default:
        return 'default';
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleStatusFilterChange = (e: SelectChangeEvent<string>) => {
    setFilterStatus(e.target.value);
  };

  const filteredPayments = payments.filter(payment => {
    const matchesSearch = 
      payment.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.receiptNumber?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || payment.status === filterStatus;
    
    return matchesSearch && matchesStatus;
  });

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" component="h1">
          Payment Management
        </Typography>
      </Box>

      <Paper sx={{ p: 2, mb: 3 }}>
        <Box display="flex" gap={2} alignItems="center">
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Search payments..."
            value={searchTerm}
            onChange={handleSearchChange}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />
          <FormControl sx={{ minWidth: 150 }} size="small">
            <InputLabel>Status</InputLabel>
            <Select
              value={filterStatus}
              onChange={handleStatusFilterChange}
              label="Status"
            >
              <MenuItem value="all">All Statuses</MenuItem>
              <MenuItem value="pending">Pending</MenuItem>
              <MenuItem value="approved">Approved</MenuItem>
              <MenuItem value="rejected">Rejected</MenuItem>
            </Select>
          </FormControl>
        </Box>
      </Paper>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Receipt #</TableCell>
              <TableCell>Student</TableCell>
              <TableCell>Class</TableCell>
              <TableCell>Amount</TableCell>
              <TableCell>Payment Date</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  <CircularProgress />
                </TableCell>
              </TableRow>
            ) : filteredPayments.length > 0 ? (
              filteredPayments.map((payment) => (
                <TableRow key={payment.id}>
                  <TableCell>{payment.receiptNumber || 'N/A'}</TableCell>
                  <TableCell>{payment.studentName}</TableCell>
                  <TableCell>{payment.className}</TableCell>
                  <TableCell>${payment.amount.toFixed(2)}</TableCell>
                  <TableCell>
                    {format(new Date(payment.paymentDate), 'MMM d, yyyy h:mm a')}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={payment.status}
                      color={getStatusColor(payment.status) as any}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <IconButton
                      aria-label="more"
                      onClick={(e) => handleMenuOpen(e, payment)}
                    >
                      <MoreVertIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  No payments found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={() => selectedPayment?.status === 'pending' && handleVerifyPayment('approve')}>
          <ListItemIcon>
            <CheckCircleIcon color="success" />
          </ListItemIcon>
          <ListItemText>Approve Payment</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => selectedPayment?.status === 'pending' && handleVerifyPayment('reject')}>
          <ListItemIcon>
            <CancelIcon color="error" />
          </ListItemIcon>
          <ListItemText>Reject Payment</ListItemText>
        </MenuItem>
        <MenuItem>
          <ListItemIcon>
            <ReceiptIcon />
          </ListItemIcon>
          <ListItemText>View Receipt</ListItemText>
        </MenuItem>
      </Menu>

      <Dialog open={openVerifyDialog} onClose={() => setOpenVerifyDialog(false)}>
        <DialogTitle>
          {verificationStatus === 'approve' ? 'Approve Payment' : 'Reject Payment'}
        </DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label={verificationStatus === 'approve' ? 'Approval Note' : 'Rejection Reason'}
            fullWidth
            multiline
            rows={4}
            value={verificationNote}
            onChange={(e) => setVerificationNote(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenVerifyDialog(false)}>Cancel</Button>
          <Button 
            onClick={handleVerifyConfirm}
            variant="contained"
            color={verificationStatus === 'approve' ? 'success' : 'error'}
          >
            {verificationStatus === 'approve' ? 'Approve' : 'Reject'} Payment
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Payments;
